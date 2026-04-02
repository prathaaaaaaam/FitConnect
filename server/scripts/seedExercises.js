require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

const exercises = [
  // CHEST
  { name: 'Bench Press', category: 'strength', muscleGroups: { primary: ['Chest'], secondary: ['Triceps', 'Front Deltoid'] }, equipment: ['Barbell', 'Bench'], difficulty: 'intermediate', instructions: ['Lie flat on bench', 'Grip bar slightly wider than shoulders', 'Lower bar to chest', 'Press back up explosively'] },
  { name: 'Incline Bench Press', category: 'strength', muscleGroups: { primary: ['Upper Chest'], secondary: ['Triceps', 'Front Deltoid'] }, equipment: ['Barbell', 'Incline Bench'], difficulty: 'intermediate' },
  { name: 'Dumbbell Flyes', category: 'strength', muscleGroups: { primary: ['Chest'], secondary: ['Front Deltoid'] }, equipment: ['Dumbbells', 'Bench'], difficulty: 'beginner' },
  { name: 'Push-Up', category: 'strength', muscleGroups: { primary: ['Chest'], secondary: ['Triceps', 'Core'] }, equipment: ['Bodyweight'], difficulty: 'beginner' },
  { name: 'Cable Crossover', category: 'strength', muscleGroups: { primary: ['Chest'], secondary: ['Front Deltoid'] }, equipment: ['Cable Machine'], difficulty: 'intermediate' },
  { name: 'Dips', category: 'strength', muscleGroups: { primary: ['Chest', 'Triceps'], secondary: ['Front Deltoid'] }, equipment: ['Dip Bar', 'Bodyweight'], difficulty: 'intermediate' },

  // BACK
  { name: 'Deadlift', category: 'strength', muscleGroups: { primary: ['Lower Back', 'Glutes', 'Hamstrings'], secondary: ['Traps', 'Lats', 'Forearms'] }, equipment: ['Barbell'], difficulty: 'advanced', instructions: ['Stand with feet hip-width apart', 'Hinge at hips, grab bar', 'Keep back straight, chest up', 'Drive through heels to stand'] },
  { name: 'Pull-Up', category: 'strength', muscleGroups: { primary: ['Lats'], secondary: ['Biceps', 'Rear Deltoid'] }, equipment: ['Pull-Up Bar', 'Bodyweight'], difficulty: 'intermediate' },
  { name: 'Barbell Row', category: 'strength', muscleGroups: { primary: ['Lats', 'Middle Back'], secondary: ['Biceps', 'Rear Deltoid'] }, equipment: ['Barbell'], difficulty: 'intermediate' },
  { name: 'Lat Pulldown', category: 'strength', muscleGroups: { primary: ['Lats'], secondary: ['Biceps', 'Rear Deltoid'] }, equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Cable Row', category: 'strength', muscleGroups: { primary: ['Middle Back'], secondary: ['Biceps', 'Lats'] }, equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'T-Bar Row', category: 'strength', muscleGroups: { primary: ['Middle Back', 'Lats'], secondary: ['Biceps'] }, equipment: ['T-Bar Machine', 'Barbell'], difficulty: 'intermediate' },

  // LEGS
  { name: 'Squat', category: 'strength', muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Lower Back'] }, equipment: ['Barbell', 'Squat Rack'], difficulty: 'intermediate', instructions: ['Bar on upper traps', 'Feet shoulder-width', 'Squat to parallel', 'Drive through heels'] },
  { name: 'Romanian Deadlift', category: 'strength', muscleGroups: { primary: ['Hamstrings', 'Glutes'], secondary: ['Lower Back'] }, equipment: ['Barbell'], difficulty: 'intermediate' },
  { name: 'Leg Press', category: 'strength', muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings'] }, equipment: ['Leg Press Machine'], difficulty: 'beginner' },
  { name: 'Lunges', category: 'strength', muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Calves'] }, equipment: ['Bodyweight', 'Dumbbells'], difficulty: 'beginner' },
  { name: 'Leg Curl', category: 'strength', muscleGroups: { primary: ['Hamstrings'], secondary: [] }, equipment: ['Leg Curl Machine'], difficulty: 'beginner' },
  { name: 'Leg Extension', category: 'strength', muscleGroups: { primary: ['Quadriceps'], secondary: [] }, equipment: ['Leg Extension Machine'], difficulty: 'beginner' },
  { name: 'Calf Raise', category: 'strength', muscleGroups: { primary: ['Calves'], secondary: [] }, equipment: ['Bodyweight', 'Calf Raise Machine'], difficulty: 'beginner' },
  { name: 'Bulgarian Split Squat', category: 'strength', muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings'] }, equipment: ['Bench', 'Dumbbells'], difficulty: 'intermediate' },
  { name: 'Hip Thrust', category: 'strength', muscleGroups: { primary: ['Glutes'], secondary: ['Hamstrings'] }, equipment: ['Barbell', 'Bench'], difficulty: 'intermediate' },

  // SHOULDERS
  { name: 'Overhead Press', category: 'strength', muscleGroups: { primary: ['Front Deltoid', 'Side Deltoid'], secondary: ['Triceps', 'Traps'] }, equipment: ['Barbell'], difficulty: 'intermediate' },
  { name: 'Dumbbell Shoulder Press', category: 'strength', muscleGroups: { primary: ['Front Deltoid', 'Side Deltoid'], secondary: ['Triceps'] }, equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Lateral Raises', category: 'strength', muscleGroups: { primary: ['Side Deltoid'], secondary: [] }, equipment: ['Dumbbells', 'Cables'], difficulty: 'beginner' },
  { name: 'Front Raises', category: 'strength', muscleGroups: { primary: ['Front Deltoid'], secondary: [] }, equipment: ['Dumbbells', 'Barbell'], difficulty: 'beginner' },
  { name: 'Face Pulls', category: 'strength', muscleGroups: { primary: ['Rear Deltoid'], secondary: ['Traps', 'Rotator Cuff'] }, equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Arnold Press', category: 'strength', muscleGroups: { primary: ['Front Deltoid', 'Side Deltoid'], secondary: ['Rear Deltoid', 'Triceps'] }, equipment: ['Dumbbells'], difficulty: 'intermediate' },

  // BICEPS
  { name: 'Barbell Curl', category: 'strength', muscleGroups: { primary: ['Biceps'], secondary: ['Brachialis', 'Forearms'] }, equipment: ['Barbell'], difficulty: 'beginner' },
  { name: 'Dumbbell Curl', category: 'strength', muscleGroups: { primary: ['Biceps'], secondary: ['Brachialis'] }, equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Hammer Curl', category: 'strength', muscleGroups: { primary: ['Brachialis', 'Biceps'], secondary: ['Forearms'] }, equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Preacher Curl', category: 'strength', muscleGroups: { primary: ['Biceps'], secondary: [] }, equipment: ['EZ Bar', 'Preacher Bench'], difficulty: 'intermediate' },
  { name: 'Cable Curl', category: 'strength', muscleGroups: { primary: ['Biceps'], secondary: [] }, equipment: ['Cable Machine'], difficulty: 'beginner' },

  // TRICEPS
  { name: 'Tricep Pushdown', category: 'strength', muscleGroups: { primary: ['Triceps'], secondary: [] }, equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Skull Crushers', category: 'strength', muscleGroups: { primary: ['Triceps'], secondary: [] }, equipment: ['EZ Bar', 'Bench'], difficulty: 'intermediate' },
  { name: 'Overhead Tricep Extension', category: 'strength', muscleGroups: { primary: ['Triceps'], secondary: [] }, equipment: ['Dumbbells', 'Cable Machine'], difficulty: 'beginner' },
  { name: 'Diamond Push-Up', category: 'strength', muscleGroups: { primary: ['Triceps'], secondary: ['Chest'] }, equipment: ['Bodyweight'], difficulty: 'intermediate' },

  // CORE
  { name: 'Plank', category: 'strength', muscleGroups: { primary: ['Core'], secondary: ['Shoulders', 'Glutes'] }, equipment: ['Bodyweight'], difficulty: 'beginner' },
  { name: 'Crunches', category: 'strength', muscleGroups: { primary: ['Abs'], secondary: [] }, equipment: ['Bodyweight'], difficulty: 'beginner' },
  { name: 'Hanging Leg Raise', category: 'strength', muscleGroups: { primary: ['Abs', 'Hip Flexors'], secondary: [] }, equipment: ['Pull-Up Bar'], difficulty: 'intermediate' },
  { name: 'Cable Crunch', category: 'strength', muscleGroups: { primary: ['Abs'], secondary: [] }, equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Russian Twist', category: 'strength', muscleGroups: { primary: ['Obliques', 'Abs'], secondary: [] }, equipment: ['Bodyweight', 'Plate'], difficulty: 'beginner' },
  { name: 'Ab Rollout', category: 'strength', muscleGroups: { primary: ['Abs', 'Core'], secondary: ['Shoulders', 'Lats'] }, equipment: ['Ab Wheel'], difficulty: 'advanced' },

  // CARDIO
  { name: 'Treadmill Run', category: 'cardio', muscleGroups: { primary: ['Cardiovascular System'], secondary: ['Legs'] }, equipment: ['Treadmill'], difficulty: 'beginner' },
  { name: 'Cycling', category: 'cardio', muscleGroups: { primary: ['Cardiovascular System'], secondary: ['Quadriceps', 'Calves'] }, equipment: ['Stationary Bike'], difficulty: 'beginner' },
  { name: 'Jump Rope', category: 'cardio', muscleGroups: { primary: ['Cardiovascular System', 'Calves'], secondary: ['Shoulders'] }, equipment: ['Jump Rope'], difficulty: 'beginner' },
  { name: 'Burpees', category: 'plyometrics', muscleGroups: { primary: ['Full Body'], secondary: [] }, equipment: ['Bodyweight'], difficulty: 'intermediate' },
  { name: 'Box Jumps', category: 'plyometrics', muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Calves', 'Core'] }, equipment: ['Plyo Box'], difficulty: 'intermediate' },
  { name: 'Battle Ropes', category: 'cardio', muscleGroups: { primary: ['Shoulders', 'Arms', 'Core'], secondary: ['Back'] }, equipment: ['Battle Ropes'], difficulty: 'intermediate' },
];

// Works standalone (npm run seed) AND when required by server.js
async function seed() {
  const isStandalone = require.main === module;
  try {
    if (isStandalone) {
      // Only connect to DB if run directly — server.js already connected
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitconnect');
    }
    await Exercise.deleteMany({ isCustom: { $ne: true } });
    await Exercise.insertMany(exercises);
    console.log(`✅ Seeded ${exercises.length} exercises`);
    if (isStandalone) process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    if (isStandalone) process.exit(1);
  }
}

seed();
