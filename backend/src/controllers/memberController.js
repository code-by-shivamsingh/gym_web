const Member = require('../models/Member');
const User = require('../models/User');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate('user', 'name email role mobile profileImage')
      .populate('trainer', 'name email mobile');
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create member
// @route   POST /api/members/create
// @access  Private (Admin/Trainer)
const createMember = async (req, res) => {
  try {
    const { name, email, mobile, plan } = req.body;

    // Check if member already exists
    let member = await Member.findOne({ email });
    if (member) {
      return res.status(400).json({ success: false, message: 'Member with this email already exists' });
    }

    // Check if user exists, else create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create user with default password (mobile number or email prefix)
      const defaultPassword = mobile || email.split('@')[0] || '123456';
      user = await User.create({
        name,
        email,
        mobile: mobile || '',
        password: defaultPassword,
        role: 'Member'
      });
    }

    // Create member
    member = await Member.create({
      user: user._id,
      name,
      email,
      mobile: mobile || '',
      plan: plan || 'Basic',
      status: 'Active'
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update member
// @route   PATCH /api/members/:id
// @access  Private (Admin/Trainer)
const updateMember = async (req, res) => {
  try {
    const { name, email, mobile, plan, status, trainerId } = req.body;

    let member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (mobile) updateFields.mobile = mobile;
    if (plan) updateFields.plan = plan;
    if (status) updateFields.status = status;
    if (trainerId) updateFields.trainer = trainerId;

    member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Sync details back to the User object if populated
    if (member.user) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (mobile) userUpdate.mobile = mobile;
      await User.findByIdAndUpdate(member.user, { $set: userUpdate });
    }

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Delete user too
    if (member.user) {
      await User.findByIdAndDelete(member.user);
    }

    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember
};
