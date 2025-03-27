import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, selectedThemes, selectedParticles } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
    });
    
    // Add 2 free themes if selected
    if (selectedThemes && Array.isArray(selectedThemes) && selectedThemes.length <= 2) {
      user.unlockedThemes = selectedThemes;
      if (selectedThemes.length > 0) {
        user.selectedTheme = selectedThemes[0];
      }
    }
    
    // Add 2 free particles if selected
    if (selectedParticles && Array.isArray(selectedParticles) && selectedParticles.length <= 2) {
      user.unlockedParticles = selectedParticles;
      user.selectedParticles = selectedParticles;
    }
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        unlockedThemes: user.unlockedThemes,
        unlockedParticles: user.unlockedParticles,
        selectedTheme: user.selectedTheme,
        selectedParticles: user.selectedParticles
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        unlockedThemes: user.unlockedThemes,
        unlockedParticles: user.unlockedParticles,
        selectedTheme: user.selectedTheme,
        selectedParticles: user.selectedParticles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
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
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        unlockedThemes: user.unlockedThemes,
        unlockedParticles: user.unlockedParticles,
        selectedTheme: user.selectedTheme,
        selectedParticles: user.selectedParticles
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving profile' 
    });
  }
});

export default router;
