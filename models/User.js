import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  passwordHistory: {
    type: [String],
    default: []
  },
  coins: {
    type: Number,
    default: 0
  },
  weeklyCoins: {
    type: Number,
    default: 0
  },
  monthlyCoins: {
    type: Number,
    default: 0
  },
  yearlyCoins: {
    type: Number,
    default: 0
  },
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  lastMonthlyReset: {
    type: Date,
    default: Date.now
  },
  lastYearlyReset: {
    type: Date,
    default: Date.now
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  powerups: {
    type: Object,
    default: {}
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
  },
  consecutiveLogins: {
    type: Number,
    default: 0
  },
  lastPassiveCollection: {
    type: Date,
    default: Date.now
  },
  activePowerups: {
    type: Map,
    of: Object,
    default: {}
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Add current password to history before changing it
    if (this.password && this.isModified('password') && this.passwordHistory) {
      // Don't add if it's a new user (no previous password)
      if (this._id) {
        this.passwordHistory.push(this.password);
        // Keep only the last 5 passwords in history
        if (this.passwordHistory.length > 5) {
          this.passwordHistory = this.passwordHistory.slice(-5);
        }
      }
    }
    
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

// Method to purchase a powerup
UserSchema.methods.purchasePowerup = function(powerupId, level = 1) {
  const currentLevel = this.powerups[powerupId] || 0;
  this.powerups[powerupId] = currentLevel + level;
  return this.save();
};

// Method to get powerup level
UserSchema.methods.getPowerupLevel = function(powerupId) {
  return this.powerups[powerupId] || 0;
};

// Method to calculate coin multiplier based on powerups
UserSchema.methods.getCoinMultiplier = function() {
  const coinBoostLevel = this.powerups.coinBoost || 0;
  // Each level of coin boost adds 20% to the base rate
  return 1 + (coinBoostLevel * 0.2);
};

// Method to calculate base coins per minute
UserSchema.methods.getCoinsPerMinute = function() {
  const coinRateLevel = this.powerups.coinRate || 0;
  // Start with 1 coin per minute, each level of coin rate adds 1 more coin per minute
  return 1 + (coinRateLevel * 4); // 1, 5, 9, 13, 17 coins per minute at levels 0-4
};

// Method to calculate bonus coins from powerups
UserSchema.methods.calculateBonusCoins = function(baseCoins) {
  let bonusCoins = 0;
  
  // Lucky Finder powerup: chance to find bonus coins
  const luckyFinderLevel = this.powerups.luckyFinder || 0;
  if (luckyFinderLevel > 0) {
    // 5% chance per level to find bonus coins
    const chanceToFind = luckyFinderLevel * 0.05;
    if (Math.random() < chanceToFind) {
      // Bonus is 10% to 50% of base coins depending on level
      const bonusPercent = 0.1 + (luckyFinderLevel * 0.08); // 10%, 18%, 26%, 34%, 42%, 50%
      bonusCoins += Math.floor(baseCoins * bonusPercent);
    }
  }
  
  // Combo Multiplier powerup: consecutive game sessions increase coins
  const comboLevel = this.powerups.comboMultiplier || 0;
  if (comboLevel > 0 && this.consecutiveLogins > 1) {
    // Each consecutive login adds a bonus (up to a cap)
    const comboBonus = Math.min(this.consecutiveLogins - 1, comboLevel * 2) * 0.05;
    bonusCoins += Math.floor(baseCoins * comboBonus);
  }
  
  // Check for active timed powerups
  if (this.activePowerups && this.activePowerups.size > 0) {
    const now = new Date();
    
    // Double Coins powerup
    const doubleCoinsPowerup = this.activePowerups.get('doubleCoins');
    if (doubleCoinsPowerup && new Date(doubleCoinsPowerup.expiresAt) > now) {
      bonusCoins += baseCoins; // Double the base coins
    }
    
    // Lucky Streak powerup
    const luckyStreakPowerup = this.activePowerups.get('luckyStreak');
    if (luckyStreakPowerup && new Date(luckyStreakPowerup.expiresAt) > now) {
      // 25% chance to get 3x coins
      if (Math.random() < 0.25) {
        bonusCoins += baseCoins * 2; // Makes it 3x total
      }
    }
  }
  
  return bonusCoins;
};

// Method to activate a timed powerup
UserSchema.methods.activatePowerup = function(powerupId) {
  // Define base duration for each powerup type (in minutes)
  const baseDurations = {
    doubleCoins: 5,
    luckyStreak: 5,
    speedBoost: 5,
    shieldProtection: 5
  };
  
  if (!baseDurations[powerupId]) {
    throw new Error(`Invalid powerup ID: ${powerupId}`);
  }
  
  // Get current powerup if it exists
  const currentPowerup = this.activePowerups.get(powerupId);
  const now = new Date();
  
  // Calculate new duration
  let durationMinutes = baseDurations[powerupId];
  let stackCount = 1;
  
  if (currentPowerup) {
    // If powerup is already active, check if it's expired
    const expiryDate = new Date(currentPowerup.expiresAt);
    if (expiryDate > now) {
      // Powerup is still active, stack the duration
      stackCount = currentPowerup.stackCount + 1;
      
      // Increase duration based on stack count
      // After 5 stacks, each new stack adds 10 minutes instead of 5
      durationMinutes = stackCount <= 5 ? 
        baseDurations[powerupId] * stackCount : 
        baseDurations[powerupId] * 5 + (stackCount - 5) * 10;
      
      // Add the new duration to the remaining time
      const remainingMs = expiryDate.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      durationMinutes += remainingMinutes;
    } else {
      // Powerup has expired, reset stack count
      stackCount = 1;
    }
  }
  
  // Calculate expiry time
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  
  // Update the powerup
  this.activePowerups.set(powerupId, {
    activatedAt: now,
    expiresAt: expiresAt,
    durationMinutes: durationMinutes,
    stackCount: stackCount
  });
  
  return this.save();
};

// Method to check if a timed powerup is active
UserSchema.methods.isPowerupActive = function(powerupId) {
  const powerup = this.activePowerups.get(powerupId);
  if (!powerup) return false;
  
  const now = new Date();
  const expiryDate = new Date(powerup.expiresAt);
  
  return expiryDate > now;
};

// Method to get all active powerups with their remaining time
UserSchema.methods.getActivePowerups = function() {
  const now = new Date();
  const activePowerups = {};
  
  this.activePowerups.forEach((powerup, powerupId) => {
    const expiryDate = new Date(powerup.expiresAt);
    if (expiryDate > now) {
      const remainingMs = expiryDate.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      
      activePowerups[powerupId] = {
        ...powerup,
        remainingMinutes: remainingMinutes
      };
    }
  });
  
  return activePowerups;
};

const User = mongoose.model('User', UserSchema);

export default User;
