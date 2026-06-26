const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['Admin', 'Trainer', 'Member'],
    default: 'Member'
  },
  profileImage: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },
  mobile: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  refreshToken: {
    type: String,
    default: ''
  },
  resetPasswordToken: {
    type: String,
    default: ''
  },
  resetPasswordExpire: {
    type: Date
  },
  resetOtp: {
    type: String,
    default: ''
  },
  resetOtpExpiry: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  lastOtpSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
