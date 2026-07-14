const WorkoutProgram = require('../models/WorkoutProgram');
const DietPlan = require('../models/DietPlan');
const WorkoutDay = require('../models/WorkoutDay');
const Exercise = require('../models/Exercise');
const ExerciseVideo = require('../models/ExerciseVideo');
const WorkoutProgress = require('../models/WorkoutProgress');
const CompletedExercise = require('../models/CompletedExercise');
const WorkoutHistory = require('../models/WorkoutHistory');
const Member = require('../models/Member');
const path = require('path');
const fs = require('fs');

// Helper: Ensure 7-Day Beginner Program exists (double safety backup)
const getOrSeedProgram = async () => {
  let program = await WorkoutProgram.findOne({ name: "7-Day Beginner Program" });
  if (!program) {
    // If not seeded yet, return the first available program or wait
    program = await WorkoutProgram.findOne();
  }
  return program;
};

// @desc    Get active workout program details
// @route   GET /api/workouts/program
// @access  Private
const getActiveProgram = async (req, res) => {
  try {
    const program = await getOrSeedProgram();
    if (!program) {
      return res.status(404).json({ success: false, message: 'No workout program configured yet.' });
    }

    const days = await WorkoutDay.find({ programId: program._id }).sort({ dayNumber: 1 });

    res.status(200).json({
      success: true,
      data: {
        program,
        days
      }
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get exercises for a specific day
// @route   GET /api/workouts/day/:day
// @access  Private
const getWorkoutDayDetails = async (req, res) => {
  try {
    const dayNumber = parseInt(req.params.day);
    const program = await getOrSeedProgram();
    if (!program) {
      return res.status(404).json({ success: false, message: 'Workout program not found.' });
    }

    const day = await WorkoutDay.findOne({ programId: program._id, dayNumber })
      .populate({
        path: 'exercises',
        options: { sort: { order: 1 } }
      });

    if (!day) {
      return res.status(404).json({ success: false, message: `Day ${dayNumber} not found in the program.` });
    }

    res.status(200).json({
      success: true,
      data: day
    });
  } catch (error) {
    console.error(`Error fetching day ${req.params.day}:`, error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get exercise details by ID
// @route   GET /api/workouts/exercise/:id
// @access  Private
const getExerciseDetails = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Error fetching exercise details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's active program progress
// @route   GET /api/workouts/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const program = await getOrSeedProgram();
    if (!program) {
      return res.status(404).json({ success: false, message: 'No workout program found.' });
    }

    let progress = await WorkoutProgress.findOne({ userId: req.user.id, programId: program._id });
    if (!progress) {
      // Auto-initialize progress if none exists
      progress = await WorkoutProgress.create({
        userId: req.user.id,
        programId: program._id,
        currentDay: 1,
        unlockedDay: 1,
        unlockedDays: [1],
        completedExercises: [],
        percentage: 0
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Start/Reset workout program
// @route   POST /api/workouts/start
// @access  Private
const startProgram = async (req, res) => {
  try {
    const program = await getOrSeedProgram();
    if (!program) {
      return res.status(404).json({ success: false, message: 'No workout program found.' });
    }

    // Delete existing progress and individual exercise completed logs
    await WorkoutProgress.deleteOne({ userId: req.user.id, programId: program._id });
    await CompletedExercise.deleteMany({ userId: req.user.id, programId: program._id });

    const newProgress = await WorkoutProgress.create({
      userId: req.user.id,
      programId: program._id,
      currentDay: 1,
      unlockedDay: 1,
      unlockedDays: [1],
      completedExercises: [],
      percentage: 0
    });

    res.status(201).json({
      success: true,
      message: 'Program started/reset successfully.',
      data: newProgress
    });
  } catch (error) {
    console.error('Error starting program:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Complete an exercise in the current day
// @route   POST /api/workouts/complete-exercise
// @access  Private
const completeExercise = async (req, res) => {
  try {
    const { programId, dayNumber, exerciseId } = req.body;
    if (!programId || !dayNumber || !exerciseId) {
      return res.status(400).json({ success: false, message: 'Missing programId, dayNumber, or exerciseId.' });
    }

    let progress = await WorkoutProgress.findOne({ userId: req.user.id, programId });
    if (!progress) {
      progress = await WorkoutProgress.create({
        userId: req.user.id,
        programId,
        currentDay: dayNumber,
        unlockedDay: dayNumber,
        completedExercises: [],
        percentage: 0
      });
    }

    // Add to CompletedExercises collection (historical records)
    await CompletedExercise.findOneAndUpdate(
      { userId: req.user.id, programId, dayNumber, exerciseId },
      { completedAt: new Date() },
      { upsert: true, new: true }
    );

    // Save active completed exercises list for the active progress
    if (!progress.completedExercises.includes(exerciseId)) {
      progress.completedExercises.push(exerciseId);
    }
    progress.lastActiveVideoId = exerciseId;
    progress.currentDay = dayNumber;

    // Calculate percentage
    const totalDays = 7;
    const dayData = await WorkoutDay.findOne({ programId, dayNumber });
    const dayExercisesCount = dayData ? dayData.exercises.length : 5;
    const activeDayCompletedCount = progress.completedExercises.length;
    
    // Percentage = (Completed Days / Total Days) * 100 + (Current Day Progress Contribution)
    const baseProgress = (progress.completedDays || []).length / totalDays;
    const currentDayContribution = (activeDayCompletedCount / dayExercisesCount) / totalDays;
    progress.percentage = Math.round((baseProgress + currentDayContribution) * 100);

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Exercise marked complete.',
      data: progress
    });
  } catch (error) {
    console.error('Error completing exercise:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Complete a workout day, unlock next day, log to history
// @route   POST /api/workouts/complete-day
// @access  Private
const completeDay = async (req, res) => {
  try {
    const { programId, dayNumber, caloriesBurned, timeSpent } = req.body;
    if (!programId || !dayNumber) {
      return res.status(400).json({ success: false, message: 'Missing programId or dayNumber.' });
    }

    let progress = await WorkoutProgress.findOne({ userId: req.user.id, programId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Workout progress not found.' });
    }

    // 1. Prevent duplicate completion
    if (progress.completedDays.includes(dayNumber)) {
      return res.status(400).json({ success: false, message: 'This workout day is already completed.' });
    }

    // 2. Validate that users cannot skip workout days
    if (dayNumber > 1 && !progress.completedDays.includes(dayNumber - 1)) {
      return res.status(400).json({ success: false, message: 'You cannot skip workout days. Please complete the previous workout day first.' });
    }

    const program = await WorkoutProgram.findById(programId);
    const durationDays = program ? program.durationDays : 7;

    // Add to completedDays array
    let completedDays = progress.completedDays || [];
    if (!completedDays.includes(dayNumber)) {
      completedDays.push(dayNumber);
      progress.completedDays = completedDays;
    }

    // Unlock next day and update unlockedDays array
    let unlockedDays = progress.unlockedDays || [1];
    if (!unlockedDays.includes(dayNumber)) {
      unlockedDays.push(dayNumber);
    }

    if (dayNumber < durationDays) {
      const nextDay = dayNumber + 1;
      progress.unlockedDay = Math.max(progress.unlockedDay, nextDay);
      if (!unlockedDays.includes(nextDay)) {
        unlockedDays.push(nextDay);
      }
      progress.currentDay = nextDay;
      // Reset daily completed exercises for the new active day
      progress.completedExercises = [];
    }
    progress.unlockedDays = unlockedDays;
    progress.completedAt = new Date();

    // Log to WorkoutHistory
    await WorkoutHistory.create({
      userId: req.user.id,
      programId,
      dayNumber,
      completionPercentage: 100,
      caloriesBurned: caloriesBurned || 0,
      timeSpent: timeSpent || 0
    });

    // Update progress percentage
    const totalDays = durationDays;
    progress.percentage = Math.round((progress.completedDays.length / totalDays) * 100);
    await progress.save();

    // Reward Member: update streak/fitness statistics in Member profile
    const member = await Member.findOne({ user: req.user.id });
    if (member) {
      // Simulate/increase age/workouts statistics
      await Member.findOneAndUpdate(
        { user: req.user.id },
        { $inc: { age: 1 } } // Incrementing weight/age or stats metrics
      );
    }

    res.status(200).json({
      success: true,
      message: `Day ${dayNumber} completed. Next day unlocked!`,
      data: progress
    });
  } catch (error) {
    console.error('Error completing day:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's workout completion history
// @route   GET /api/workouts/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const history = await WorkoutHistory.find({ userId: req.user.id })
      .populate('programId')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// =========================================================================
// ADMIN EXERCISE CRUD CONTROLLERS
// =========================================================================

// @desc    Get all exercises (Admin view)
// @route   GET /api/workouts/videos (Mapped for compatibility with existing UI)
// @access  Private (Admin)
const getAdminVideos = async (req, res) => {
  try {
    // Map Exercise collection to represent "videos" in the admin dashboard
    const exercises = await Exercise.find().sort({ createdAt: -1 });
    
    // Map fields to match what the client admin screen expects
    const mapped = exercises.map(ex => ({
      _id: ex._id,
      title: ex.name,
      category: ex.targetMuscles[0] || 'Strength',
      muscleGroup: ex.targetMuscles.join(', '),
      level: ex.difficulty,
      day: 'Monday', // Fallback for simple display, or we can look up WorkoutDay
      duration: Math.round(ex.duration / 60),
      videoUrl: ex.videoUrl,
      thumbnail: ex.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
      description: ex.description,
      caloriesBurn: ex.calories,
      equipmentRequired: ex.equipmentRequired
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error getting admin exercises:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create workout exercise video
// @route   POST /api/workouts/videos
// @access  Private (Admin)
const createAdminVideo = async (req, res) => {
  try {
    const {
      title,
      category,
      muscleGroup,
      level,
      day,
      duration,
      videoUrl,
      thumbnail,
      description,
      caloriesBurn,
      equipmentRequired
    } = req.body;

    const exercise = await Exercise.create({
      name: title,
      description,
      targetMuscles: muscleGroup.split(',').map(m => m.trim()),
      equipmentRequired,
      difficulty: level,
      calories: parseInt(caloriesBurn) || 0,
      duration: (parseInt(duration) || 10) * 60,
      videoUrl,
      thumbnailUrl: thumbnail
    });

    // Also link it into WorkoutDay if specified
    const program = await getOrSeedProgram();
    if (program && day) {
      await WorkoutDay.findOneAndUpdate(
        { programId: program._id, title: day }, // e.g. Day 1, Day 2
        { $push: { exercises: exercise._id } }
      );
      // Or find by Day label directly
      const dayNum = parseInt(day.replace(/^\D+/g, ''));
      if (!isNaN(dayNum)) {
        await WorkoutDay.findOneAndUpdate(
          { programId: program._id, dayNumber: dayNum },
          { $push: { exercises: exercise._id } }
        );
      }
    }

    // Add into ExerciseVideos
    await ExerciseVideo.create({
      exerciseId: exercise._id,
      videoUrl,
      thumbnailUrl: thumbnail,
      storageType: videoUrl.includes('localhost') ? 'local' : 'external'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: exercise._id,
        title: exercise.name,
        videoUrl: exercise.videoUrl
      }
    });
  } catch (error) {
    console.error('Error creating admin exercise:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update workout exercise video
// @route   PUT /api/workouts/videos/:id
// @access  Private (Admin)
const updateAdminVideo = async (req, res) => {
  try {
    const {
      title,
      category,
      muscleGroup,
      level,
      duration,
      videoUrl,
      thumbnail,
      description,
      caloriesBurn,
      equipmentRequired
    } = req.body;

    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: title,
          description,
          targetMuscles: typeof muscleGroup === 'string' ? muscleGroup.split(',').map(m => m.trim()) : muscleGroup,
          equipmentRequired,
          difficulty: level,
          calories: parseInt(caloriesBurn) || 0,
          duration: (parseInt(duration) || 10) * 60,
          videoUrl,
          thumbnailUrl: thumbnail
        }
      },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }

    // Update in ExerciseVideos
    await ExerciseVideo.findOneAndUpdate(
      { exerciseId: exercise._id },
      { $set: { videoUrl, thumbnailUrl: thumbnail } }
    );

    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    console.error('Error updating admin exercise:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete workout exercise video
// @route   DELETE /api/workouts/videos/:id
// @access  Private (Admin)
const deleteAdminVideo = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }

    // Remove from all WorkoutDay records
    await WorkoutDay.updateMany(
      { exercises: req.params.id },
      { $pull: { exercises: req.params.id } }
    );

    // Remove from ExerciseVideos
    await ExerciseVideo.deleteMany({ exerciseId: req.params.id });

    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    console.error('Error deleting admin exercise:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's active diet plan
// @route   GET /api/diet
// @access  Private
const getDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ user: req.user.id });
    if (!dietPlan) {
      // Return a default mock/fallback diet plan if none exists in database
      return res.status(200).json({
        success: true,
        data: {
          title: "Standard Gym Diet Plan",
          meals: [
            { name: "Breakfast: Oatmeal & Egg Whites", calories: 450, time: "08:00 AM" },
            { name: "Lunch: Grilled Chicken & Brown Rice", calories: 650, time: "01:00 PM" },
            { name: "Snack: Whey Protein & Almonds", calories: 300, time: "05:00 PM" },
            { name: "Dinner: Salmon & Broccoli", calories: 500, time: "08:00 PM" }
          ]
        }
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getActiveProgram,
  getWorkoutDayDetails,
  getExerciseDetails,
  getProgress,
  startProgram,
  completeExercise,
  completeDay,
  getHistory,
  getDietPlan,

  // Admin interfaces
  getAdminVideos,
  createAdminVideo,
  updateAdminVideo,
  deleteAdminVideo
};
