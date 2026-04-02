const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number },
  weight: { type: Number, default: 0 }, // in kg
  duration: { type: Number }, // in seconds, for timed exercises
  completed: { type: Boolean, default: true },
  isPersonalRecord: { type: Boolean, default: false },
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String, required: true }, // denormalized for performance
  sets: [setSchema],
  notes: { type: String, default: '' },
  personalRecord: { type: Boolean, default: false },
});

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Workout' },
    exercises: [workoutExerciseSchema],
    duration: { type: Number, default: 0 }, // in minutes
    notes: { type: String, default: '' },
    totalVolume: { type: Number, default: 0 }, // total kg lifted
    personalRecordsCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Calculate total volume before save
workoutSchema.pre('save', function (next) {
  let volume = 0;
  let prCount = 0;
  this.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      if (set.weight && set.reps) volume += set.weight * set.reps;
      if (set.isPersonalRecord) prCount++;
    });
    if (ex.personalRecord) prCount++;
  });
  this.totalVolume = Math.round(volume);
  this.personalRecordsCount = prCount;
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
