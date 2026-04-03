require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const exerciseRoutes = require('./routes/exercises');
const feedRoutes = require('./routes/feed');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'FitConnect API running 💪' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Auto-seed exercises if none exist
async function autoSeed() {
  try {
    const Exercise = require('./models/Exercise');
    const count = await Exercise.countDocuments();
    if (count === 0) {
      console.log('📦 No exercises found — seeding...');
      require('./scripts/seedExercises');
    } else {
      console.log(`✅ Exercise library ready (${count} exercises)`);
    }
  } catch (err) {
    console.error('Seed check failed:', err.message);
  }
}

// Prevent Render free tier from sleeping
const https = require('https');
setInterval(() => {
  https.get('https://fitconnect-g4t5.onrender.com/api/health', (res) => {
    console.log('Keep-alive ping:', res.statusCode);
  }).on('error', () => {});
}, 14 * 60 * 1000); // every 14 minutes
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitconnect')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await autoSeed();
    const PORT = process.env.PORT || 5000;
    // Keep-alive ping (free tier)
const https = require('https');
setInterval(() => {
  https.get(process.env.RENDER_EXTERNAL_URL + '/api/health', () => {});
}, 14 * 60 * 1000); // ping every 14 minutes
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
