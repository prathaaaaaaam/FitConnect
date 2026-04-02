const express = require('express');
const Workout = require('../models/Workout');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/workouts - Log a new workout
router.post('/', protect, async (req, res) => {
  try {
    const { title, exercises, duration, notes, isPublic } = req.body;

    const workout = await Workout.create({
      user: req.user._id,
      title: title || `Workout - ${new Date().toLocaleDateString()}`,
      exercises,
      duration,
      notes,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    // Check for personal records
    const user = await User.findById(req.user._id);
    let newPRs = [];

    for (const ex of exercises) {
      const maxWeight = Math.max(
        ...ex.sets.map((s) => (s.weight || 0) * (s.reps || 1)),
        0
      );
      if (maxWeight > 0) {
        const existingPR = user.personalRecords.find(
          (pr) => pr.exercise === ex.exerciseName
        );
        if (!existingPR || existingPR.weight * existingPR.reps < maxWeight) {
          const bestSet = ex.sets.reduce((best, s) =>
            (s.weight || 0) * (s.reps || 1) > (best.weight || 0) * (best.reps || 1) ? s : best
          );
          if (existingPR) {
            existingPR.weight = bestSet.weight;
            existingPR.reps = bestSet.reps;
            existingPR.date = new Date();
          } else {
            user.personalRecords.push({
              exercise: ex.exerciseName,
              weight: bestSet.weight,
              reps: bestSet.reps,
              date: new Date(),
            });
          }
          newPRs.push(ex.exerciseName);
        }
      }
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastDate || lastDate < yesterday) {
      user.currentStreak = 1;
    } else if (lastDate.getTime() === yesterday.getTime()) {
      user.currentStreak += 1;
    }
    // Same day - don't change streak

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.totalWorkouts += 1;
    user.lastWorkoutDate = new Date();
    await user.save();

    const populatedWorkout = await Workout.findById(workout._id).populate('user', 'name username avatar');

    res.status(201).json({ workout: populatedWorkout, newPRs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workouts/my - Get user's workouts
router.get('/my', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const workouts = await Workout.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name username avatar');

    const total = await Workout.countDocuments({ user: req.user._id });

    res.json({ workouts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workouts/stats - Comprehensive user stats
router.get('/stats', protect, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ createdAt: 1 });
    const now = new Date();

    // ── Basic totals ──────────────────────────────────────────
    const totalVolume = workouts.reduce((s, w) => s + (w.totalVolume || 0), 0);
    const totalDuration = workouts.reduce((s, w) => s + (w.duration || 0), 0);
    const totalSets = workouts.reduce((s, w) => s + w.exercises.reduce((s2, e) => s2 + e.sets.length, 0), 0);
    const avgDuration = workouts.length ? Math.round(totalDuration / workouts.length) : 0;
    const avgVolume = workouts.length ? Math.round(totalVolume / workouts.length) : 0;

    // ── Best single workout ───────────────────────────────────
    const bestWorkout = workouts.reduce((best, w) =>
      (w.totalVolume || 0) > (best?.totalVolume || 0) ? w : best, null);

    // ── This week / this month ────────────────────────────────
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const workoutsThisWeek = workouts.filter(w => new Date(w.createdAt) >= startOfWeek).length;
    const workoutsThisMonth = workouts.filter(w => new Date(w.createdAt) >= startOfMonth).length;
    const volumeThisMonth = workouts
      .filter(w => new Date(w.createdAt) >= startOfMonth)
      .reduce((s, w) => s + (w.totalVolume || 0), 0);

    // ── Weekly volume — last 10 weeks ─────────────────────────
    const weeklyVolume = [];
    for (let i = 9; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const wws = workouts.filter(w => new Date(w.createdAt) >= weekStart && new Date(w.createdAt) < weekEnd);
      weeklyVolume.push({
        week: `W${10 - i}`,
        volume: wws.reduce((s, w) => s + (w.totalVolume || 0), 0),
        workouts: wws.length,
        duration: wws.reduce((s, w) => s + (w.duration || 0), 0),
      });
    }

    // ── Daily volume — last 30 days ────────────────────────────
    const dailyVolume = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      const dws = workouts.filter(w => new Date(w.createdAt) >= day && new Date(w.createdAt) <= dayEnd);
      dailyVolume.push({
        date: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        volume: dws.reduce((s, w) => s + (w.totalVolume || 0), 0),
        workouts: dws.length,
      });
    }

    // ── Muscle group frequency ────────────────────────────────
    const muscleCount = {};
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        // exerciseName gives us a clue but we track via sets
        const name = ex.exerciseName || '';
        // Use set count as proxy for volume per exercise
        const setVol = ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
        if (!muscleCount[name]) muscleCount[name] = { sets: 0, volume: 0, count: 0 };
        muscleCount[name].sets += ex.sets.length;
        muscleCount[name].volume += setVol;
        muscleCount[name].count += 1;
      });
    });

    // Top 8 exercises by frequency
    const topExercises = Object.entries(muscleCount)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ── Workout days of week heatmap ──────────────────────────
    const dayOfWeekCounts = Array(7).fill(0);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    workouts.forEach(w => {
      const d = new Date(w.createdAt).getDay();
      dayOfWeekCounts[d]++;
    });
    const workoutsByDay = dayNames.map((day, i) => ({ day, count: dayOfWeekCounts[i] }));

    // ── Monthly workouts last 6 months ────────────────────────
    const monthlyWorkouts = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const mws = workouts.filter(w => new Date(w.createdAt) >= mStart && new Date(w.createdAt) <= mEnd);
      monthlyWorkouts.push({
        month: mStart.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        workouts: mws.length,
        volume: mws.reduce((s, w) => s + (w.totalVolume || 0), 0),
        duration: mws.reduce((s, w) => s + (w.duration || 0), 0),
      });
    }

    // ── Consistency score (%) ─────────────────────────────────
    // Based on last 30 days: workout days / 30 * 100
    const last30Days = workouts.filter(w => {
      const d = new Date(w.createdAt);
      return (now - d) / (1000 * 60 * 60 * 24) <= 30;
    });
    const activeDays = new Set(last30Days.map(w => new Date(w.createdAt).toDateString())).size;
    const consistencyScore = Math.round((activeDays / 30) * 100);

    res.json({
      // Totals
      totalWorkouts: workouts.length,
      totalVolume,
      totalDuration,
      totalSets,
      avgDuration,
      avgVolume,
      // This period
      workoutsThisWeek,
      workoutsThisMonth,
      volumeThisMonth,
      consistencyScore,
      activeDaysLast30: activeDays,
      // Streaks
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      // PRs
      personalRecords: req.user.personalRecords,
      // Charts
      weeklyVolume,
      dailyVolume,
      monthlyWorkouts,
      workoutsByDay,
      topExercises,
      // Best
      bestWorkout: bestWorkout ? {
        title: bestWorkout.title,
        volume: bestWorkout.totalVolume,
        date: bestWorkout.createdAt,
        exercises: bestWorkout.exercises?.length,
      } : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workouts/:id - Get single workout
router.get('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('user', 'name username avatar');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json({ workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/workouts/:id/like - Like/unlike a workout
router.post('/:id/like', protect, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    const alreadyLiked = workout.likes.includes(req.user._id);
    if (alreadyLiked) {
      workout.likes = workout.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      workout.likes.push(req.user._id);
    }
    await workout.save();

    res.json({ likes: workout.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/workouts/:id/comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    workout.comments.push({
      user: req.user._id,
      username: req.user.username,
      text,
    });
    await workout.save();

    res.json({ comments: workout.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await workout.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalWorkouts: -1 } });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
