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
    const overview = await Attendance.find()
      .populate('user', 'name email mobile role')
      .sort({ checkIn: -1 });
    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getHistory,
  getAdminOverview
};
