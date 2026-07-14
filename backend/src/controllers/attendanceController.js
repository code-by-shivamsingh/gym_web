const Attendance = require('../models/Attendance');

// @desc    Check-in attendance
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
  try {
    // Check if already checked in today (and hasn't checked out)
    const activeSession = await Attendance.findOne({
      user: req.user.id,
      checkOut: null
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: 'You are already checked in. Please check out first.'
      });
    }

    const session = await Attendance.create({
      user: req.user.id,
      checkIn: new Date()
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Check-out attendance
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
  try {
    const activeSession = await Attendance.findOne({
      user: req.user.id,
      checkOut: null
    });

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in found. Please check in first.'
      });
    }

    activeSession.checkOut = new Date();
    await activeSession.save();

    res.status(200).json({ success: true, data: activeSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get attendance history for logged-in user
// @route   GET /api/attendance/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ user: req.user.id })
      .sort({ checkIn: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get admin attendance overview
// @route   GET /api/attendance/admin-overview
// @access  Private (Admin/Trainer)
const getAdminOverview = async (req, res) => {
  try {
    const liveUsers = await Attendance.find({ checkOut: null })
      .populate('user', 'name email mobile role')
      .sort({ checkIn: -1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = await Attendance.countDocuments({
      checkIn: { $gte: startOfToday }
    });

    const history = await Attendance.find()
      .populate('user', 'name email mobile role')
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      data: {
        liveUsers,
        todayCount,
        history
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's current attendance status and gym distance
// @route   GET /api/attendance/current-status
// @access  Private
const getCurrentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const activeSession = await Attendance.findOne({ user: userId, checkOut: null })
      .populate('gym', 'gymName latitude longitude allowedRadius');
      
    const GymLocation = require('../models/GymLocation');
    const UserLocationTracking = require('../models/UserLocationTracking');
    
    const gym = await GymLocation.findOne();
    const lastTrackingLog = await UserLocationTracking.findOne({ userId }).sort({ createdAt: -1 });

    let distance = null;
    let isInside = false;

    if (gym && lastTrackingLog) {
      const lat1 = lastTrackingLog.latitude;
      const lon1 = lastTrackingLog.longitude;
      const lat2 = gym.latitude;
      const lon2 = gym.longitude;

      const R = 6371e3; // meters
      const phi1 = lat1 * Math.PI/180;
      const phi2 = lat2 * Math.PI/180;
      const deltaPhi = (lat2-lat1) * Math.PI/180;
      const deltaLambda = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = Math.round(R * c);
      isInside = distance <= gym.allowedRadius;
    }

    res.status(200).json({
      success: true,
      data: {
        isCheckedIn: !!activeSession,
        activeSession,
        distance,
        isInside,
        gymName: gym ? gym.gymName : null
      }
    });
  } catch (error) {
    console.error('Error fetching current attendance status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getHistory,
  getAdminOverview,
  getCurrentStatus
};
