const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProfile, updateProfile, uploadAvatar, logLocation } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  console.log(`Uploading file: ${file.originalname}, mimetype: ${file.mimetype}`);
  const filetypes = /jpeg|jpg|png|webp|jfif|pjpeg|x-png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg/jpg/png/webp) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);
router.post('/location', logLocation);

module.exports = router;
