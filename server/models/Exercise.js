const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['strength', 'cardio', 'flexibility', 'balance', 'plyometrics'],
      required: true,
    },
    muscleGroups: {
      primary: [{ type: String }],
      secondary: [{ type: String }],
    },
    equipment: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    instructions: [{ type: String }],
    tips: [{ type: String }],
    videoUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: 'text', 'muscleGroups.primary': 'text' });

module.exports = mongoose.model('Exercise', exerciseSchema);
