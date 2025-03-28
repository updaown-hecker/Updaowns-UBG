import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Start game session
router.post('/start-session', auth, async (req, res) => {
  try {
    const { gameId } = req.body;
    
    if (!gameId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Game ID is required' 
      });
    }
    
    // Update user's last game session
    req.user.lastGameSession = {
      gameId,
      startTime: new Date(),
      endTime: null
    };
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Game session started',
      sessionInfo: req.user.lastGameSession
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error starting game session' 
    });
  }
});

// End game session and award coins
router.post('/end-session', auth, async (req, res) => {
  try {
    const { gameId } = req.body;
    
    if (!gameId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Game ID is required' 
      });
    }
    
    // Check if there's an active session for this game
    if (!req.user.lastGameSession || req.user.lastGameSession.gameId !== gameId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No active session found for this game' 
      });
    }
    
    // Calculate session duration in minutes
    const startTime = new Date(req.user.lastGameSession.startTime);
    const endTime = new Date();
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    
    // Get coin multiplier and base rate from user's powerups
    const coinMultiplier = req.user.getCoinMultiplier();
    const coinsPerMinute = req.user.getCoinsPerMinute();
    
    // Award coins based on gameplay time, base rate, and multiplier
    const baseCoins = Math.max(1, durationMinutes * coinsPerMinute);
    const multipliedCoins = Math.floor(baseCoins * coinMultiplier);
    
    // Calculate any bonus coins from other powerups
    const bonusCoins = req.user.calculateBonusCoins(multipliedCoins);
    
    // Total coins earned
    const coinsEarned = multipliedCoins + bonusCoins;
    
    // Update user's game play time
    const currentGameTime = req.user.gamePlayTime[gameId] || 0;
    req.user.gamePlayTime[gameId] = currentGameTime + durationMinutes;
    
    // Update session end time
    req.user.lastGameSession.endTime = endTime;
    
    // Add coins to user's account
    req.user.coins += coinsEarned;
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Game session ended',
      coinsEarned,
      baseCoins,
      multiplier: coinMultiplier,
      coinsPerMinute,
      bonusCoins,
      totalCoins: req.user.coins,
      sessionDuration: durationMinutes
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error ending game session' 
    });
  }
});

// Get user's coin balance
router.get('/balance', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      coins: req.user.coins,
      unlockedThemes: req.user.unlockedThemes,
      unlockedParticles: req.user.unlockedParticles,
      powerups: req.user.powerups,
      coinMultiplier: req.user.getCoinMultiplier()
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving coin balance' 
    });
  }
});

// Purchase a theme
router.post('/purchase/theme', auth, async (req, res) => {
  try {
    const { themeName } = req.body;
    const themeCost = 50; // Cost in coins
    
    if (!themeName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Theme name is required' 
      });
    }
    
    // Check if user already has this theme
    if (req.user.unlockedThemes.includes(themeName)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already own this theme' 
      });
    }
    
    // Check if user has enough coins
    if (req.user.coins < themeCost) {
      return res.status(400).json({ 
        success: false, 
        message: `Not enough coins. This theme costs ${themeCost} coins.` 
      });
    }
    
    // Deduct coins and add theme
    req.user.coins -= themeCost;
    req.user.unlockedThemes.push(themeName);
    
    await req.user.save();
    
    res.json({
      success: true,
      message: `Successfully purchased ${themeName} theme`,
      remainingCoins: req.user.coins,
      unlockedThemes: req.user.unlockedThemes
    });
  } catch (error) {
    console.error('Theme purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during theme purchase' 
    });
  }
});

// Purchase a particle effect
router.post('/purchase/particle', auth, async (req, res) => {
  try {
    const { particleName } = req.body;
    const particleCost = 30; // Cost in coins
    
    if (!particleName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Particle effect name is required' 
      });
    }
    
    // Check if user already has this particle effect
    if (req.user.unlockedParticles.includes(particleName)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already own this particle effect' 
      });
    }
    
    // Check if user has enough coins
    if (req.user.coins < particleCost) {
      return res.status(400).json({ 
        success: false, 
        message: `Not enough coins. This particle effect costs ${particleCost} coins.` 
      });
    }
    
    // Deduct coins and add particle effect
    req.user.coins -= particleCost;
    req.user.unlockedParticles.push(particleName);
    
    await req.user.save();
    
    res.json({
      success: true,
      message: `Successfully purchased ${particleName} particle effect`,
      remainingCoins: req.user.coins,
      unlockedParticles: req.user.unlockedParticles
    });
  } catch (error) {
    console.error('Particle purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during particle effect purchase' 
    });
  }
});

// Get available powerups
router.get('/powerups', auth, async (req, res) => {
  try {
    // Define available powerups
    const availablePowerups = [
      {
        id: 'coinBoost',
        name: 'Coin Booster',
        description: 'Increases coins earned per minute of gameplay by 20% per level',
        baseCost: 100,
        maxLevel: 5,
        icon: '💰'
      },
      {
        id: 'coinRate',
        name: 'Coin Accelerator',
        description: 'Earn 5 coins per minute of gameplay at level 1, increasing by 4 coins per level',
        baseCost: 150,
        maxLevel: 4,
        icon: '⚡'
      },
      {
        id: 'autoClicker',
        name: 'Auto Clicker',
        description: 'Automatically earns 1 coin per minute per level even when you\'re not playing',
        baseCost: 200,
        maxLevel: 3,
        icon: '🖱️'
      },
      {
        id: 'luckyFinder',
        name: 'Lucky Finder',
        description: '5% chance per level to find bonus coins after each game session',
        baseCost: 150,
        maxLevel: 5,
        icon: '🍀'
      },
      {
        id: 'comboMultiplier',
        name: 'Combo Multiplier',
        description: 'Earn 5% more coins for each consecutive day you play (stacks based on level)',
        baseCost: 180,
        maxLevel: 3,
        icon: '🔄'
      }
    ];
    
    // Add user's current level for each powerup
    const powerupsWithLevels = availablePowerups.map(powerup => ({
      ...powerup,
      currentLevel: req.user.getPowerupLevel(powerup.id),
      currentCost: calculatePowerupCost(powerup.baseCost, req.user.getPowerupLevel(powerup.id))
    }));
    
    res.json({
      success: true,
      powerups: powerupsWithLevels
    });
  } catch (error) {
    console.error('Powerups fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving powerups' 
    });
  }
});

// Purchase a powerup
router.post('/purchase/powerup', auth, async (req, res) => {
  try {
    const { powerupId } = req.body;
    
    if (!powerupId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Powerup ID is required' 
      });
    }
    
    // Define available powerups (should be moved to a config file in production)
    const availablePowerups = {
      coinBoost: { baseCost: 100, maxLevel: 5 },
      coinRate: { baseCost: 150, maxLevel: 4 },
      autoClicker: { baseCost: 200, maxLevel: 3 },
      luckyFinder: { baseCost: 150, maxLevel: 5 },
      comboMultiplier: { baseCost: 180, maxLevel: 3 }
    };
    
    // Check if powerup exists
    if (!availablePowerups[powerupId]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid powerup ID' 
      });
    }
    
    const powerup = availablePowerups[powerupId];
    const currentLevel = req.user.getPowerupLevel(powerupId);
    
    // Check if powerup is already at max level
    if (currentLevel >= powerup.maxLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Powerup already at maximum level' 
      });
    }
    
    // Calculate cost based on current level
    const cost = calculatePowerupCost(powerup.baseCost, currentLevel);
    
    // Check if user has enough coins
    if (req.user.coins < cost) {
      return res.status(400).json({ 
        success: false, 
        message: `Not enough coins. This powerup costs ${cost} coins.` 
      });
    }
    
    // Deduct coins and upgrade powerup
    req.user.coins -= cost;
    await req.user.purchasePowerup(powerupId);
    
    // Get updated level
    const newLevel = req.user.getPowerupLevel(powerupId);
    
    res.json({
      success: true,
      message: `Successfully upgraded ${powerupId} to level ${newLevel}`,
      remainingCoins: req.user.coins,
      powerupId,
      newLevel,
      nextLevelCost: newLevel < powerup.maxLevel ? calculatePowerupCost(powerup.baseCost, newLevel) : null
    });
  } catch (error) {
    console.error('Powerup purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during powerup purchase' 
    });
  }
});

// Helper function to calculate powerup cost based on level
function calculatePowerupCost(baseCost, currentLevel) {
  // Each level increases the cost by 50%
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

// Collect passive coins from auto clicker
router.post('/collect-passive', auth, async (req, res) => {
  try {
    // Get auto clicker level
    const autoClickerLevel = req.user.getPowerupLevel('autoClicker');
    
    if (autoClickerLevel <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You don\'t have the Auto Clicker powerup' 
      });
    }
    
    // Calculate time since last collection
    const lastCollection = req.user.lastPassiveCollection || req.user.lastLogin;
    const now = new Date();
    const minutesSinceLastCollection = Math.floor((now - lastCollection) / (1000 * 60));
    
    // Cap at 24 hours (1440 minutes) to prevent excessive coin accumulation
    const cappedMinutes = Math.min(minutesSinceLastCollection, 1440);
    
    // Calculate coins earned (1 per minute per level)
    const coinsEarned = cappedMinutes * autoClickerLevel;
    
    if (coinsEarned <= 0) {
      return res.json({
        success: true,
        message: 'No passive coins to collect yet',
        minutesSinceLastCollection,
        autoClickerLevel
      });
    }
    
    // Add coins to user's account
    req.user.coins += coinsEarned;
    req.user.lastPassiveCollection = now;
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Passive coins collected',
      coinsEarned,
      minutesSinceLastCollection: cappedMinutes,
      coinsPerMinute: autoClickerLevel,
      totalCoins: req.user.coins
    });
  } catch (error) {
    console.error('Passive collection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error collecting passive coins' 
    });
  }
});

export default router;
