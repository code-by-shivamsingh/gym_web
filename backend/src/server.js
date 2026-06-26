const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const connectDB = require('./database/db');
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// CORS Settings
app.use(cors({
  origin: true, // Reflect request origin to allow cookies/auth headers across local domains
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Start Server
const server = app.listen(config.PORT, () => {
  logger.info(`Server running in development mode on port ${config.PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Trigger nodemon reload

