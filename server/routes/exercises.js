const express = require('express');
const Exercise = require('../models/Exercise');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/exercises - Get all exercises with optional filters
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, muscle, equipment, difficulty } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (muscle) filter['muscleGroups.primary'] = { $in: [muscle] };
    if (equipment) filter.equipment = { $in: [equipment] };
    if (difficulty) filter.difficulty = difficulty;

    const exercises = await Exercise.find(filter).sort({ name: 1 }).limit(100);
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exercises/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json({ exercise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exercises - Create custom exercise
router.post('/', protect, async (req, res) => {
  try {
    const exercise = await Exercise.create({
      ...req.body,
      isCustom: true,
      createdBy: req.user._id,
    });
    res.status(201).json({ exercise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
