const express = require('express');
const {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  assignMembersToTrainer
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTrainers);
router.post('/', authorize('Admin'), createTrainer);
router.put('/:id', authorize('Admin'), updateTrainer);
router.delete('/:id', authorize('Admin'), deleteTrainer);
router.post('/:trainerId/assign', authorize('Admin'), assignMembersToTrainer);

module.exports = router;
