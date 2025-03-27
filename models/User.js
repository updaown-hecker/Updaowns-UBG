import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  coins: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  unlockedThemes: {
    type: [String],
    default: []
  },
  unlockedParticles: {
    type: [String],
    default: []
  },
  selectedTheme: {
    type: String,
    default: 'default'
  },
  selectedParticles: {
    type: [String],
    default: []
  },
  gamePlayTime: {
    type: Map,
    of: Number,
    default: {}
  },
  lastGameSession: {
    gameId: String,
    startTime: Date,
    endTime: Date
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add coins
UserSchema.methods.addCoins = function(amount) {
  this.coins += amount;
  return this.save();
};

// Method to unlock a theme
UserSchema.methods.unlockTheme = function(themeName) {
  if (!this.unlockedThemes.includes(themeName)) {
    this.unlockedThemes.push(themeName);
  }
  return this.save();
};

// Method to unlock a particle effect
UserSchema.methods.unlockParticle = function(particleName) {
  if (!this.unlockedParticles.includes(particleName)) {
    this.unlockedParticles.push(particleName);
  }
  return this.save();
};

const User = mongoose.model('User', UserSchema);

export default User;
