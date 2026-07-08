const mongoose = require('mongoose');
const config = require('../config/config');

let isShutdownHookRegistered = false;

// Helper to mask password in MongoDB URI
const maskMongoURI = (uri) => {
  if (!uri) return 'undefined';
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
  } catch (err) {
    return 'hidden';
  }
};

// Health check function
const getDBHealth = async () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const status = {
    state: states[readyState] || 'Unknown',
    readyState,
    ok: readyState === 1
  };

  if (readyState === 1) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      status.pingTimeMs = Date.now() - start;
      status.ping = 'OK';
    } catch (err) {
      status.ping = 'Failed';
      status.pingError = err.message;
      status.ok = false;
    }
  } else {
    status.ping = 'N/A';
  }

  return status;
};

// Helper to attempt starting local MongoDB server daemon
const tryStartLocalMongo = () => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    const dbPath = path.join(__dirname, '../../data');
    console.log(`[DB] ⚡ Local MongoDB is offline. Attempting to spin up local mongod instance using path: ${dbPath}...`);
    
    // Search standard Windows Program Files directory for mongod.exe if not in PATH
    let mongodExe = 'mongod';
    const baseProgramFiles = 'C:\\Program Files\\MongoDB\\Server';
    if (fs.existsSync(baseProgramFiles)) {
      try {
        const versions = fs.readdirSync(baseProgramFiles);
        // Sort descending to prioritize newest version
        versions.sort((a, b) => parseFloat(b) - parseFloat(a));
        for (const v of versions) {
          const binPath = path.join(baseProgramFiles, v, 'bin', 'mongod.exe');
          if (fs.existsSync(binPath)) {
            mongodExe = `"${binPath}"`;
            console.log(`[DB] 🔍 Found local MongoDB executable at: ${binPath}`);
            break;
          }
        }
      } catch (err) {
        // Skip directory read errors
      }
    }
    
    // Spawn mongod daemon pointing to project data directory
    const cmd = `${mongodExe} --dbpath "${dbPath}" --port 27017`;
    
    // Execute asynchronously
    exec(cmd, (error) => {
      if (error) {
        // Resolve immediately on error (e.g. command not found or port already bound)
        resolve(false);
      }
    });
    
    // Allow 2.5 seconds for the database engine socket to bind
    setTimeout(() => {
      resolve(true);
    }, 2500);
  });
};

// Database connection logic
const connectDB = async () => {
  if (!isShutdownHookRegistered) {
    registerShutdownHooks();
  }

  // If already connected, skip
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const localUri = config.MONGO_URI || 'mongodb://127.0.0.1:27017/forge_gym';
  const atlasUri = config.MONGO_ATLAS_URI;

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout fast for rapid retry/fallback
    socketTimeoutMS: 45000,
    retryWrites: true,
  };

  const maxRetries = 10;
  let currentRetry = 1;
  let triedStartingMongo = false;

  while (currentRetry <= maxRetries) {
    try {
      // 1. Try local URI first
      console.log(`[DB] ⏳ Connecting to local MongoDB: ${maskMongoURI(localUri)}...`);
      await mongoose.connect(localUri, options);
      
      // Ping check
      await mongoose.connection.db.admin().ping();
      
      console.log('\n======================================================');
      console.log('✅ Connected to local MongoDB successfully');
      console.log(`   Database Name:   ${mongoose.connection.db.databaseName}`);
      console.log(`   Host:            ${mongoose.connection.host}`);
      console.log(`   Port:            ${mongoose.connection.port}`);
      console.log('======================================================\n');

      await seedDefaultUsers();
      return mongoose.connection;

    } catch (localError) {
      console.warn(`[DB] ⚠️ Local MongoDB connection failed: ${localError.message}`);
      await mongoose.disconnect().catch(() => {});

      // Self-healing recovery: attempt to start mongod in background
      if (!triedStartingMongo && localError.message.includes('ECONNREFUSED')) {
        triedStartingMongo = true;
        await tryStartLocalMongo();
        console.log('[DB] 🔄 Retrying local connection after database daemon startup attempt...');
        continue; // Instantly retry local connection loop
      }

      // 2. Try Atlas URI if configured
      if (atlasUri) {
        try {
          console.log(`[DB] 🔄 Automatically switching to fallback MongoDB Atlas: ${maskMongoURI(atlasUri)}...`);
          await mongoose.connect(atlasUri, options);
          
          // Ping check
          await mongoose.connection.db.admin().ping();
          
          console.log('\n======================================================');
          console.log('✅ Connected to MongoDB Atlas successfully');
          console.log(`   Database Name:   ${mongoose.connection.db.databaseName}`);
          console.log(`   Host:            ${mongoose.connection.host}`);
          console.log(`   Port:            ${mongoose.connection.port}`);
          console.log('======================================================\n');

          await seedDefaultUsers();
          return mongoose.connection;

        } catch (atlasError) {
          console.error(`[DB] ❌ MongoDB Atlas connection failed: ${atlasError.message}`);
          await mongoose.disconnect().catch(() => {});
        }
      }

      // If both failed, retry after a delay
      console.error(`[DB] ❌ Connection attempt ${currentRetry}/${maxRetries} failed.`);
      if (currentRetry === maxRetries) {
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts.`);
      }

      const retrySeconds = 5;
      console.log(`[DB] ⏳ Retrying in ${retrySeconds} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000));
      currentRetry++;
    }
  }
};

const registerShutdownHooks = () => {
  isShutdownHookRegistered = true;
  
  const gracefulShutdown = async (signal) => {
    console.log(`\n[DB] 🛑 Received ${signal}. Starting graceful shutdown...`);
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('[DB] ✅ Mongoose connection closed successfully.');
      }
      process.exit(0);
    } catch (err) {
      console.error('[DB] ❌ Error closing Mongoose connection:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

const seedDefaultUsers = async () => {
  try {
    const User = require('../models/User');
    const Member = require('../models/Member');
    
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[DB] Seeding default users (Admin & Member)...');
      
      const admin = await User.create({
        name: 'Gym Administrator',
        email: 'admin@gmail.com',
        mobile: '9876543210',
        password: 'password123',
        role: 'Admin'
      });
      console.log(`[DB] Default Admin created: ${admin.email}`);

      const memberUser = await User.create({
        name: 'John Member',
        email: 'member@gmail.com',
        mobile: '8765432109',
        password: 'password123',
        role: 'Member'
      });
      console.log(`[DB] Default Member user created: ${memberUser.email}`);
      
      const memberProfile = await Member.create({
        user: memberUser._id,
        name: memberUser.name,
        email: memberUser.email,
        mobile: memberUser.mobile,
        plan: 'Premium',
        status: 'Active'
      });
      console.log(`[DB] Default Member profile created for: ${memberProfile.name}`);
    }

    const shivamExists = await User.findOne({ email: 'shivamsikarwar7610@gmail.com' });
    if (!shivamExists) {
      console.log('[DB] Seeding Shivam test account...');
      const shivamUser = await User.create({
        name: 'Shivam Sikarwar',
        email: 'shivamsikarwar7610@gmail.com',
        mobile: '9999999999',
        password: 'password123',
        role: 'Member'
      });
      
      const shivamProfile = await Member.create({
        user: shivamUser._id,
        name: shivamUser.name,
        email: shivamUser.email,
        mobile: shivamUser.mobile,
        plan: 'Premium',
        status: 'Active'
      });
      console.log(`[DB] Shivam test account seeded successfully: ${shivamUser.email}`);
    }

    const MembershipPlan = require('../models/MembershipPlan');
    const plansCount = await MembershipPlan.countDocuments();
    if (plansCount === 0) {
      console.log('[DB] Seeding default membership plans...');
      await MembershipPlan.create([
        {
          name: 'Basic',
          price: 999,
          features: ['Gym Access', 'Locker Facility', 'Basic Support'],
          popular: false
        },
        {
          name: 'Silver',
          price: 1499,
          features: ['Gym Access', 'Locker Facility', 'Standard Support', 'General Trainer'],
          popular: false
        },
        {
          name: 'Gold',
          price: 2499,
          features: ['Gym Access', 'Personal Trainer', 'Diet Plan', 'Locker Facility'],
          popular: true
        },
        {
          name: 'Premium',
          price: 4999,
          features: ['Gym Access', 'Personal Trainer', 'Diet Plan', 'Workout Plan', 'Priority Support'],
          popular: false
        }
      ]);
      console.log('[DB] Membership plans seeded successfully!');
    }
  } catch (err) {
    console.error('[DB] Seeding default users failed:', err.message);
  }
};

module.exports = connectDB;
module.exports.getDBHealth = getDBHealth;
