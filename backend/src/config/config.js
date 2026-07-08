const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Path candidates for .env file
const rootEnvPath = path.join(__dirname, '../../../.env');
const backendEnvPath = path.join(__dirname, '../../.env');

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

module.exports = {
  PORT: process.env.PORT || 5000,
  // Standardize MONGO_URI: check MONGO_URI or MONGODB_URI
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/forge_gym',
  MONGO_ATLAS_URI: process.env.MONGO_ATLAS_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'forge_gym_super_secret_access_key_12345',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'forge_gym_super_secret_refresh_key_54321',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // SMTP settings
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,

  // OTP settings
  OTP_PROVIDER: process.env.OTP_PROVIDER || 'email'
};
