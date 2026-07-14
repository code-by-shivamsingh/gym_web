const Settings = require('../models/Settings');
const GymLocation = require('../models/GymLocation');

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
        address: 'Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India',
        mobile: '+1234567890',
        whatsapp: '+919876543210',
        taxRate: 18
      });
    }

    let gymLoc = await GymLocation.findOne();
    if (!gymLoc) {
      gymLoc = await GymLocation.create({
        gymName: settings.gymName || 'Forge Gym',
        latitude: 26.2669994,
        longitude: 78.2169687,
        allowedRadius: 50
      });
    }

    const data = settings.toObject();
    data.gymLocation = gymLoc;

    res.status(200).json({ success: true, data });
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
    const { gymName, address, mobile, whatsapp, taxRate, latitude, longitude, allowedRadius } = req.body;

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

    let gymLoc = await GymLocation.findOne();
    const locData = {};
    if (gymName) locData.gymName = gymName;
    if (latitude !== undefined) locData.latitude = Number(latitude);
    if (longitude !== undefined) locData.longitude = Number(longitude);
    if (allowedRadius !== undefined) locData.allowedRadius = Number(allowedRadius);

    if (Object.keys(locData).length > 0) {
      if (!gymLoc) {
        gymLoc = await GymLocation.create({
          gymName: gymName || 'Forge Gym',
          latitude: Number(latitude) || 26.2669994,
          longitude: Number(longitude) || 78.2169687,
          allowedRadius: Number(allowedRadius) || 50
        });
      } else {
        gymLoc = await GymLocation.findByIdAndUpdate(
          gymLoc._id,
          { $set: locData },
          { new: true, runValidators: true }
        );
      }
    } else if (!gymLoc) {
      gymLoc = await GymLocation.create({
        gymName: settings.gymName || 'Forge Gym',
        latitude: 26.2669994,
        longitude: 78.2169687,
        allowedRadius: 50
      });
    }

    const data = settings.toObject();
    data.gymLocation = gymLoc;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
