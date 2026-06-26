const Settings = require('../models/Settings');

// @desc    Get gym settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create defaults if not found
      settings = await Settings.create({
        gymName: 'Forge Gym',
        address: 'Gwalior, Madhya Pradesh (M.P.), India',
        mobile: '+1234567890',
        whatsapp: '+919876543210',
        taxRate: 18
      });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update gym settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const { gymName, address, mobile, whatsapp, taxRate } = req.body;

    let settings = await Settings.findOne();
    
    const updateData = {};
    if (gymName) updateData.gymName = gymName;
    if (address) updateData.address = address;
    if (mobile) updateData.mobile = mobile;
    if (whatsapp) updateData.whatsapp = whatsapp;
    if (taxRate !== undefined) updateData.taxRate = Number(taxRate);

    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
