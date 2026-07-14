const User = require('../models/User');
const Member = require('../models/Member');
const GymLocation = require('../models/GymLocation');
const UserLocationTracking = require('../models/UserLocationTracking');
const Attendance = require('../models/Attendance');

// Helper to calculate distance in meters between two lat/lng points (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

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
    const { name, mobile, profileImage, age, weight, height, fitnessGoal } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (mobile) fieldsToUpdate.mobile = mobile;
    if (profileImage) fieldsToUpdate.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    if (user && user.role === 'Member') {
      const memberUpdate = {};
      if (age !== undefined) memberUpdate.age = Number(age) || null;
      if (weight !== undefined) memberUpdate.weight = Number(weight) || null;
      if (height !== undefined) memberUpdate.height = Number(height) || null;
      if (fitnessGoal !== undefined) memberUpdate.fitnessGoal = fitnessGoal;

      if (weight && height) {
        const heightM = Number(height) / 100;
        memberUpdate.bmi = Number((Number(weight) / (heightM * heightM)).toFixed(1));
      }

      await Member.findOneAndUpdate(
        { user: user._id },
        { $set: memberUpdate },
        { new: true, upsert: true }
      );
    }

    // Refetch full profile with new details
    const updatedUser = await User.findById(req.user.id).lean();
    if (updatedUser.role === 'Member') {
      updatedUser.memberDetails = await Member.findOne({ user: updatedUser._id })
        .populate('trainer', 'name email mobile specialization experience');
    }

    res.status(200).json({ success: true, data: updatedUser });
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

// @desc    Log user location telemetry and handle auto check-in/check-out
// @route   POST /api/users/location
// @access  Private
const logLocation = async (req, res) => {
  try {
    const { latitude, longitude, deviceType, accuracy } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const userId = req.user.id;

    // 1. GPS permission & Spoofing validation
    if (latitude === 0 && longitude === 0) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates (0,0) detected.' });
    }
    if (accuracy !== undefined && accuracy > 200) {
      return res.status(400).json({ success: false, message: 'GPS accuracy is too low (>200m). Telemetry rejected.' });
    }

    // 2. Unrealistic velocity detection (Fake GPS spoofing filter)
    const lastTrackingLog = await UserLocationTracking.findOne({ userId }).sort({ createdAt: -1 });
    if (lastTrackingLog) {
      const timeDiffSec = (Date.now() - lastTrackingLog.createdAt.getTime()) / 1000;
      if (timeDiffSec > 0 && timeDiffSec < 60) {
        const distMoved = getDistance(Number(latitude), Number(longitude), lastTrackingLog.latitude, lastTrackingLog.longitude);
        const speedKmh = (distMoved / timeDiffSec) * 3.6;
        if (speedKmh > 300) {
          console.warn(`[SECURITY WARNING] User ${req.user.name} location rejected due to unrealistic speed: ${speedKmh.toFixed(1)} km/h`);
          return res.status(400).json({ success: false, message: 'Spoofed or unrealistic movement detected.' });
        }
      }
    }

    // Fetch configured gym location
    const gym = await GymLocation.findOne();
    if (!gym) {
      // Just log location if no gym configured
      await UserLocationTracking.create({
        userId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        deviceType: deviceType || 'web',
        accuracy: accuracy !== undefined ? Number(accuracy) : null,
        isInside: false
      });
      return res.status(200).json({
        success: true,
        message: 'Location logged, but no gym is configured.',
        data: { distance: null, isInside: false, isCheckedIn: false }
      });
    }

    // Calculate distance to gym
    const distance = getDistance(Number(latitude), Number(longitude), gym.latitude, gym.longitude);
    const isInside = distance <= gym.allowedRadius;

    // Log the location with isInside and accuracy flags
    await UserLocationTracking.create({
      userId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      deviceType: deviceType || 'web',
      accuracy: accuracy !== undefined ? Number(accuracy) : null,
      isInside
    });

    let activeSession = await Attendance.findOne({ user: userId, checkOut: null });

    // 1. Gym entry detection (Auto check-in)
    if (isInside && !activeSession) {
      activeSession = await Attendance.create({
        user: userId,
        gym: gym._id,
        checkIn: new Date(),
        checkInTime: new Date(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        status: 'Present',
        source: 'Automatic GPS'
      });
      console.log(`[GPS AUTO-CHECKIN] User ${req.user.name} checked in at ${gym.gymName}.`);
    }

    // 2. Gym leave detection (Auto check-out via immediate update)
    if (!isInside && activeSession) {
      const lastInsideLog = await UserLocationTracking.findOne({
        userId,
        isInside: true
      }).sort({ createdAt: -1 });

      const lastSeenInside = lastInsideLog ? lastInsideLog.createdAt : activeSession.checkIn;
      const timeOutside = Date.now() - lastSeenInside.getTime();

      if (timeOutside > 20 * 60 * 1000) {
        // Checked out automatically
        activeSession.checkOut = new Date();
        activeSession.checkOutTime = new Date();
        activeSession.status = 'Completed';
        
        const durationMs = activeSession.checkOut.getTime() - activeSession.checkIn.getTime();
        activeSession.totalDuration = Math.round(durationMs / 60000);
        
        await activeSession.save();
        console.log(`[GPS AUTO-CHECKOUT] User ${req.user.name} checked out automatically after 20 minutes.`);
        activeSession = null;
      }
    }

    res.status(200).json({
      success: true,
      message: isInside 
        ? `You are inside ${gym.gymName}. Attendance marked.` 
        : 'Location logged.',
      data: {
        distance: Math.round(distance),
        isInside,
        isCheckedIn: !!activeSession,
        activeSession,
        gymName: gym.gymName
      }
    });
  } catch (error) {
    console.error('Error logging location:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  logLocation
};
