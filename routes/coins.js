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
    
    // Award 1 coin per minute of gameplay (adjust as needed)
    const coinsEarned = Math.max(1, durationMinutes);
    
    // Update user's game play time
    const currentGameTime = req.user.gamePlayTime.get(gameId) || 0;
    req.user.gamePlayTime.set(gameId, currentGameTime + durationMinutes);
    
    // Update session end time
    req.user.lastGameSession.endTime = endTime;
    
    // Add coins to user's account
    req.user.coins += coinsEarned;
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Game session ended',
      coinsEarned,
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
      unlockedParticles: req.user.unlockedParticles
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

export default router;
