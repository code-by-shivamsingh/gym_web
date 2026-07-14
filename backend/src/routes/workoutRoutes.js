const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  getActiveProgram,
  getWorkoutDayDetails,
  getExerciseDetails,
  getProgress,
  startProgram,
  completeExercise,
  completeDay,
  getHistory,
  
  // Admin endpoints
  getAdminVideos, 
  createAdminVideo, 
  updateAdminVideo, 
  deleteAdminVideo 
} = require('../controllers/workoutController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure workouts base uploads directory exists
const baseWorkoutsDir = path.join(__dirname, '../../public/uploads/workouts');
if (!fs.existsSync(baseWorkoutsDir)) {
  fs.mkdirSync(baseWorkoutsDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Read parameters from body or default to beginner/day1
    const program = (req.body.program || 'beginner').toLowerCase().replace(/\s+/g, '-');
    const day = (req.body.day || 'day1').toLowerCase().replace(/\s+/g, '-');
    
    const targetDir = path.join(__dirname, `../../public/uploads/workouts/${program}/${day}`);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const rawFilename = req.body.filename || `${Date.now()}`;
    const slugFilename = rawFilename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `${slugFilename}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for high-quality gym videos
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.mp4' || ext === '.webm') {
      return cb(null, true);
    }
    cb(new Error('Only MP4 and WebM video formats are allowed!'));
  }
});

// Member progress endpoints
router.get('/program', protect, getActiveProgram);
router.get('/day/:day', protect, getWorkoutDayDetails);
router.get('/exercise/:id', protect, getExerciseDetails);
router.get('/progress', protect, getProgress);
router.post('/start', protect, startProgram);
router.post('/complete-exercise', protect, completeExercise);
router.post('/complete-day', protect, completeDay);
router.get('/history', protect, getHistory);

// Admin Video CRUD endpoints
router.get('/videos', protect, authorize('Admin'), getAdminVideos);
router.post('/videos', protect, authorize('Admin'), createAdminVideo);
router.put('/videos/:id', protect, authorize('Admin'), updateAdminVideo);
router.delete('/videos/:id', protect, authorize('Admin'), deleteAdminVideo);

// Admin Video Upload endpoint
router.post('/upload-video', protect, authorize('Admin'), upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video file.' });
    }

    const program = (req.body.program || 'beginner').toLowerCase().replace(/\s+/g, '-');
    const day = (req.body.day || 'day1').toLowerCase().replace(/\s+/g, '-');
    const relativeUrl = `/uploads/workouts/${program}/${day}/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully.',
      data: {
        url: relativeUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ success: false, message: 'Server Error during video upload.' });
  }
});

module.exports = router;
