const User = require('../models/User');
const Member = require('../models/Member');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'Member') {
      const member = await Member.findOne({ user: user._id })
        .populate('trainer', 'name email mobile specialization experience');
      user.memberDetails = member;
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, mobile, profileImage } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (mobile) fieldsToUpdate.mobile = mobile;
    if (profileImage) fieldsToUpdate.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Upload avatar
// @route   POST /api/users/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Set user profile image to local static file path
    const profileImagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: profileImagePath },
      { new: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar
};
