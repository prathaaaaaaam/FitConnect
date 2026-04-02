const express = require('express');
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/feed - Get activity feed (following + own)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const followingIds = [...(req.user.following || []), req.user._id];

    const workouts = await Workout.find({
      user: { $in: followingIds },
      isPublic: true,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name username avatar fitnessGoal');

    const total = await Workout.countDocuments({
      user: { $in: followingIds },
      isPublic: true,
    });

    res.json({ workouts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feed/discover - Discover public workouts from all users
router.get('/discover', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const workouts = await Workout.find({ isPublic: true })
      .sort({ createdAt: -1, 'likes.length': -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name username avatar fitnessGoal');

    res.json({ workouts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
