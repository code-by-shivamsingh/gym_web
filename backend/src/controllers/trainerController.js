const User = require('../models/User');
const Member = require('../models/Member');
const { createNotificationHelper } = require('./notificationController');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
const getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'Trainer' });
    res.status(200).json({ success: true, data: trainers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create trainer
// @route   POST /api/trainers
// @access  Private (Admin)
const createTrainer = async (req, res) => {
  try {
    const { name, email, password, mobile, specialization, experience } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const trainer = await User.create({
      name,
      email,
      password: password || '123456',
      mobile: mobile || '',
      specialization: specialization || '',
      experience: experience || '',
      role: 'Trainer'
    });

    res.status(201).json({ success: true, data: trainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private (Admin)
const updateTrainer = async (req, res) => {
  try {
    const { name, email, mobile, specialization, experience } = req.body;

    let trainer = await User.findById(req.params.id);
    if (!trainer || trainer.role !== 'Trainer') {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (mobile) updateFields.mobile = mobile;
    if (specialization) updateFields.specialization = specialization;
    if (experience) updateFields.experience = experience;

    trainer = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private (Admin)
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id);
    if (!trainer || trainer.role !== 'Trainer') {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Unassign this trainer from all members
    await Member.updateMany({ trainer: req.params.id }, { $set: { trainer: null } });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Assign members to trainer
// @route   POST /api/trainers/:trainerId/assign
// @access  Private (Admin)
const assignMembersToTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { memberIds } = req.body;

    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'Trainer') {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const members = await Member.find({ _id: { $in: memberIds } });

    // Update members
    await Member.updateMany(
      { _id: { $in: memberIds } },
      { $set: { trainer: trainerId } }
    );

    // Create notifications for each user
    for (const member of members) {
      if (member.user) {
        await createNotificationHelper(
          member.user,
          'Trainer Assigned! 💪',
          `Trainer ${trainer.name} has been assigned to help you reach your gym and fitness goals.`,
          'trainer'
        );
      }
    }

    res.status(200).json({ success: true, message: 'Members assigned to trainer successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  assignMembersToTrainer
};
