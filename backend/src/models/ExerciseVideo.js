const mongoose = require('mongoose');

const ExerciseVideoSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: false // Optional if upload is general first
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  storageType: {
    type: String,
    enum: ['local', 'cloudinary', 's3', 'external'],
    default: 'external'
  },
  cloudinaryPublicId: {
    type: String,
    default: ''
  },
  s3Key: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'ExerciseVideos'
});

module.exports = mongoose.model('ExerciseVideo', ExerciseVideoSchema);
