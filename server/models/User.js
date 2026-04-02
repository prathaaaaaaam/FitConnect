const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
    age: { type: Number },
    weight: { type: Number }, // in kg
    height: { type: Number }, // in cm
    fitnessGoal: {
      type: String,
      enum: ['strength', 'muscle', 'endurance', 'weight_loss', 'general'],
      default: 'general',
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalWorkouts: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    personalRecords: [
      {
        exercise: { type: String },
        weight: { type: Number },
        reps: { type: Number },
        date: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
