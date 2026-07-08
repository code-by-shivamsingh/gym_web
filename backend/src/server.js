const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./database/database');
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !config[varName]);
if (!config.MONGO_URI && !config.MONGO_ATLAS_URI) {
  missingVars.push('MONGO_URI or MONGO_ATLAS_URI');
}

if (missingVars.length > 0) {
  console.error('\n======================================================');
  console.error('❌ CRITICAL ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES');
  console.error('======================================================');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('======================================================\n');
  process.exit(1);
}

let helmet, compression, cookieParser;
try {
  helmet = require('helmet');
} catch (e) {
  helmet = () => (req, res, next) => next();
}
try {
  compression = require('compression');
} catch (e) {
  compression = () => (req, res, next) => next();
}
try {
  cookieParser = require('cookie-parser');
} catch (e) {
  cookieParser = () => (req, res, next) => next();
}

// Initialize Express App
const app = express();

// Enable trust proxy to correctly read X-Forwarded-For headers in rate limiting
app.enable('trust proxy');

// CORS Settings
app.use(cors({
  origin: true, // Reflect request origin to allow cookies/auth headers across local domains
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for easier dev/swagger assets loading
}));
app.use(compression());
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mongo Query Sanitization Middleware to prevent NoSQL injection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          console.warn(`[SECURITY WARNING] Deleted potential NoSQL Injection key: ${key}`);
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

// Real-time file logging middleware for request/response tracing
app.use((req, res, next) => {
  const fs = require('fs');
  const path = require('path');
  const originalJson = res.json;
  
  let responseData = '';
  res.json = function(data) {
    responseData = JSON.stringify(data);
    return originalJson.apply(res, arguments);
  };

  res.on('finish', () => {
    try {
      const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - IP: ${req.ip}\n` +
                       `  Request Headers: ${JSON.stringify(req.headers)}\n` +
                       `  Request Body:    ${JSON.stringify(req.body)}\n` +
                       `  Response Body:   ${responseData}\n` +
                       `--------------------------------------------------------------------------------\n`;
      fs.appendFileSync(path.join(__dirname, '../request_log.txt'), logEntry);
    } catch (err) {
      // Ignore logger write errors
    }
  });
  next();
});

// Set Static Folder
app.use(express.static(path.join(__dirname, '../public')));

// Mount API Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/diet', require('./routes/dietRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await require('./database/database').getDBHealth();
    res.status(dbHealth.ok ? 200 : 500).json({
      status: dbHealth.ok ? 'UP' : 'DOWN',
      timestamp: new Date(),
      uptime: process.uptime(),
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      error: error.message
    });
  }
});

// Fallback route
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Central Error Handler
app.use(errorHandler);

// Auto-free port if in use (Windows development only)
if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
  try {
    const { execSync } = require('child_process');
    const port = config.PORT || 5000;
    const stdout = execSync('netstat -ano').toString();
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes(`:${port}`) && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && parseInt(pid) !== process.pid) {
          logger.info(`Port ${port} in use by process ${pid}. Killing it to free up the port...`);
          execSync(`taskkill /F /PID ${pid}`);
        }
      }
    }
  } catch (err) {
    logger.warn(`Could not check/free port ${config.PORT}: ${err.message}`);
  }
}

// Start Server Initialization
const startServer = async () => {
  try {
    // Await database connection, exit process on failure
    try {
      await connectDB();
    } catch (err) {
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(
        path.join(__dirname, '../startup_error.txt'),
        `DATABASE CONNECTION FAILED AT ${new Date().toISOString()}:\n${err.stack || err.message}\n`
      );
      console.error('\n======================================================');
      console.error('❌ CRITICAL ERROR: DATABASE CONNECTION FAILED');
      console.error('======================================================');
      console.error(`Error: ${err.message}`);
      console.error('The server cannot start without an active database connection.');
      console.error('Please verify MongoDB is running and configurations are correct.');
      console.error('======================================================\n');
      process.exit(1);
    }
    
    // Detect local IP addresses to help match mobile api configurations
    try {
      const os = require('os');
      const fs = require('fs');
      const path = require('path');
      const interfaces = os.networkInterfaces();
      const addresses = [];
      for (const name in interfaces) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
          }
        }
      }
      const ipContent = `Active local IPv4 addresses for server connection:\n` +
                        addresses.map(ip => `- ${ip}`).join('\n') + 
                        `\n\n(Current config.js PORT: ${config.PORT})\n`;
      fs.writeFileSync(path.join(__dirname, '../server_ip.txt'), ipContent);
      console.log('[NETWORK] 🌐 Saved current IP addresses to server_ip.txt');
    } catch (netErr) {
      // Ignored
    }
    
    const server = app.listen(config.PORT, () => {
      console.log(`✅ Server Running on Port ${config.PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error('\n======================================================');
      console.error('🔥 UNHANDLED PROMISE REJECTION DETECTED');
      console.error('======================================================');
      console.error(`Error Message: ${err.message}`);
      console.error(`Stack Trace: ${err.stack}`);
      console.error('======================================================\n');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('\n======================================================');
      console.error('🔥 UNCAUGHT EXCEPTION DETECTED');
      console.error('======================================================');
      console.error(`Error Message: ${err.message}`);
      console.error(`Stack Trace: ${err.stack}`);
      console.error('======================================================\n');
    });
  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.join(__dirname, '../startup_error.txt'),
      `SERVER BOOTSTRAP FAILED AT ${new Date().toISOString()}:\n${err.stack || err.message}\n`
    );
    logger.error('Failed to boot server: ' + err.message);
  }
};

startServer();

// Trigger nodemon reload

