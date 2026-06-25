const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Internal utility helper to create a notification from other controllers
const createNotificationHelper = async (userId, title, message, type = 'info') => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = {
  getNotifications,
  createNotificationHelper
};
