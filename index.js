import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createBareServer } from "@nebula-services/bare-server-node";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import basicAuth from "express-basic-auth";
import mime from "mime";
import fetch from "node-fetch";
import dotenv from "dotenv";
// import { setupMasqr } from "./Masqr.js";
import config from "./config.js";

dotenv.config();
console.log(chalk.yellow("🚀 Starting server..."));

// File paths for data storage
const __dirname = process.cwd();
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load users from file or initialize empty array
let users = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log(chalk.green(`Loaded ${users.length} user(s) from storage`));
  }
} catch (error) {
  console.error(chalk.red('Error loading users from file:'), error);
  users = [];
}

// Function to save users to file
function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log(chalk.blue(`Saved ${users.length} user(s) to storage`));
  } catch (error) {
    console.error(chalk.red('Error saving users to file:'), error);
  }
}

const server = http.createServer();
const app = express();
const bareServer = createBareServer("/fq/");
const PORT = process.env.PORT || 8080;
const cache = new Map();
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // Cache for 30 Days

if (config.challenge !== false) {
  console.log(
    chalk.green("🔒 Password protection is enabled! Listing logins below"),
  );
  // biome-ignore lint/complexity/noForEach:
  Object.entries(config.users).forEach(([username, password]) => {
    console.log(chalk.blue(`Username: ${username}, Password: ${password}`));
  });
  app.use(basicAuth({ users: config.users, challenge: true }));
}

app.get("/e/*", async (req, res, next) => {
  try {
    if (cache.has(req.path)) {
      const { data, contentType, timestamp } = cache.get(req.path);
      if (Date.now() - timestamp > CACHE_TTL) {
        cache.delete(req.path);
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        return res.end(data);
      }
    }

    const baseUrls = {
      "/e/1/": "https://raw.githubusercontent.com/qrs/x/fixy/",
      "/e/2/": "https://raw.githubusercontent.com/3v1/V5-Assets/main/",
      "/e/3/": "https://raw.githubusercontent.com/3v1/V5-Retro/master/",
    };

    let reqTarget;
    for (const [prefix, baseUrl] of Object.entries(baseUrls)) {
      if (req.path.startsWith(prefix)) {
        reqTarget = baseUrl + req.path.slice(prefix.length);
        break;
      }
    }

    if (!reqTarget) {
      return next();
    }

    const asset = await fetch(reqTarget);
    if (!asset.ok) {
      return next();
    }

    const data = Buffer.from(await asset.arrayBuffer());
    const ext = path.extname(reqTarget);
    const no = [".unityweb"];
    const contentType = no.includes(ext)
      ? "application/octet-stream"
      : mime.getType(ext);

    cache.set(req.path, { data, contentType, timestamp: Date.now() });
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.setHeader("Content-Type", "text/html");
    res.status(500).send("Error fetching the asset");
  }
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes

// Simple API Routes for authentication and coins
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, selectedThemes, selectedParticles } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Username or email already exists' });
  }
  
  // Determine if user should be admin (only for development, in production this would be more secure)
  const role = username.toLowerCase().includes('admin') ? 'admin' : 'user';
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password, // In a real app, you would hash this password
    role, // Add role field
    coins: 0,
    unlockedThemes: selectedThemes && Array.isArray(selectedThemes) && selectedThemes.length <= 2 ? selectedThemes : ['default'],
    unlockedParticles: selectedParticles && Array.isArray(selectedParticles) && selectedParticles.length <= 2 ? selectedParticles : [],
    selectedTheme: selectedThemes && Array.isArray(selectedThemes) && selectedThemes.length > 0 ? selectedThemes[0] : 'default',
    selectedParticles: selectedParticles && Array.isArray(selectedParticles) && selectedParticles.length > 0 ? selectedParticles : [],
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  users.push(newUser);
  saveUsers(); // Save users to file
  
  // In a real app, you would generate a JWT token here
  res.status(201).json({
    success: true,
    token: `demo-token-${newUser.id}`,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      coins: newUser.coins,
      unlockedThemes: newUser.unlockedThemes,
      unlockedParticles: newUser.unlockedParticles,
      selectedTheme: newUser.selectedTheme,
      selectedParticles: newUser.selectedParticles,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
  
  // Update last login
  user.lastLogin = new Date();
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    token: `demo-token-${user.id}`,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user', // Include role in response
      coins: user.coins,
      unlockedThemes: user.unlockedThemes,
      unlockedParticles: user.unlockedParticles,
      selectedTheme: user.selectedTheme,
      selectedParticles: user.selectedParticles,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  const token = req.header('x-auth-token');
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user', // Include role in response
      coins: user.coins,
      unlockedThemes: user.unlockedThemes,
      unlockedParticles: user.unlockedParticles,
      selectedTheme: user.selectedTheme,
      selectedParticles: user.selectedParticles,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

// Change password route
app.post('/api/auth/change-password', (req, res) => {
  const token = req.header('x-auth-token');
  const { currentPassword, newPassword } = req.body;
  
  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
  }
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Verify current password
  if (user.password !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  
  // Initialize password history if not exists
  if (!user.passwordHistory) {
    user.passwordHistory = [];
  }
  
  // Check if new password is in history
  if (user.passwordHistory.includes(newPassword) || user.password === newPassword) {
    return res.status(400).json({ success: false, message: 'New password cannot be the same as current or previous passwords' });
  }
  
  // Add current password to history
  user.passwordHistory.push(user.password);
  
  // Keep only the last 5 passwords in history
  if (user.passwordHistory.length > 5) {
    user.passwordHistory = user.passwordHistory.slice(-5);
  }
  
  // Update password
  user.password = newPassword;
  
  // Save changes
  saveUsers();
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Coin management routes
app.post('/api/coins/start-session', (req, res) => {
  const token = req.header('x-auth-token');
  const { gameId } = req.body;
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Store session info
  user.lastGameSession = {
    gameId,
    startTime: new Date(),
    endTime: null
  };
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: 'Game session started',
    sessionInfo: user.lastGameSession
  });
});

app.post('/api/coins/end-session', (req, res) => {
  const token = req.header('x-auth-token');
  const { gameId } = req.body;
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Check if there's an active session
  if (!user.lastGameSession || user.lastGameSession.gameId !== gameId) {
    return res.status(400).json({ success: false, message: 'No active session found for this game' });
  }
  
  // Calculate session duration in minutes
  const startTime = new Date(user.lastGameSession.startTime);
  const endTime = new Date();
  const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
  
  // Calculate coin multiplier based on powerups
  const coinBoostLevel = user.powerups?.coinBoost || 0;
  const coinMultiplier = 1 + (coinBoostLevel * 0.2);
  
  // Award coins based on gameplay time and multiplier
  const baseCoins = Math.max(1, durationMinutes);
  const coinsEarned = Math.floor(baseCoins * coinMultiplier);
  
  // Check for lucky finder bonus
  let luckyBonus = 0;
  const luckyFinderLevel = user.powerups?.luckyFinder || 0;
  if (luckyFinderLevel > 0) {
    // 5% chance per level to find bonus coins
    const luckyChance = luckyFinderLevel * 0.05;
    if (Math.random() < luckyChance) {
      luckyBonus = Math.floor(coinsEarned * 0.5); // 50% bonus
    }
  }
  
  // Update session end time
  user.lastGameSession.endTime = endTime;
  
  // Add coins to user's account
  user.coins += coinsEarned + luckyBonus;
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: 'Game session ended',
    coinsEarned,
    luckyBonus,
    totalCoins: user.coins,
    multiplier: coinMultiplier,
    sessionDuration: durationMinutes
  });
});

app.post('/api/coins/purchase/theme', (req, res) => {
  const token = req.header('x-auth-token');
  const { themeName } = req.body;
  const themeCost = 50; // Cost in coins
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Check if user already has this theme
  if (user.unlockedThemes.includes(themeName)) {
    return res.status(400).json({ success: false, message: 'You already own this theme' });
  }
  
  // Check if user has enough coins
  if (user.coins < themeCost) {
    return res.status(400).json({ success: false, message: `Not enough coins. This theme costs ${themeCost} coins.` });
  }
  
  // Deduct coins and add theme
  user.coins -= themeCost;
  user.unlockedThemes.push(themeName);
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: `Successfully purchased ${themeName} theme`,
    remainingCoins: user.coins,
    unlockedThemes: user.unlockedThemes
  });
});

app.post('/api/coins/purchase/particle', (req, res) => {
  const token = req.header('x-auth-token');
  const { particleName } = req.body;
  const particleCost = 30; // Cost in coins
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Check if user already has this particle
  if (user.unlockedParticles.includes(particleName)) {
    return res.status(400).json({ success: false, message: 'You already own this particle effect' });
  }
  
  // Check if user has enough coins
  if (user.coins < particleCost) {
    return res.status(400).json({ success: false, message: `Not enough coins. This particle effect costs ${particleCost} coins.` });
  }
  
  // Deduct coins and add particle
  user.coins -= particleCost;
  user.unlockedParticles.push(particleName);
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: `Successfully purchased ${particleName} particle effect`,
    remainingCoins: user.coins,
    unlockedParticles: user.unlockedParticles
  });
});

// Powerup routes
app.get('/api/coins/powerups', (req, res) => {
  const token = req.header('x-auth-token');
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Initialize powerups if not exists
  if (!user.powerups) {
    user.powerups = {};
  }
  
  // Define available powerups
  const availablePowerups = [
    {
      id: 'coinBoost',
      name: 'Coin Booster',
      description: 'Increases coins earned per minute of gameplay by 20% per level',
      baseCost: 100,
      maxLevel: 5,
      icon: '💰',
      type: 'permanent'
    },
    {
      id: 'coinRate',
      name: 'Coin Accelerator',
      description: 'Earn 5 coins per minute of gameplay at level 1, increasing by 4 coins per level',
      baseCost: 150,
      maxLevel: 4,
      icon: '⚡',
      type: 'permanent'
    },
    {
      id: 'autoClicker',
      name: 'Auto Clicker',
      description: 'Automatically earns 1 coin per minute per level even when you\'re not playing',
      baseCost: 200,
      maxLevel: 3,
      icon: '🖱️',
      type: 'permanent'
    },
    {
      id: 'luckyFinder',
      name: 'Lucky Finder',
      description: '5% chance per level to find bonus coins after each game session',
      baseCost: 150,
      maxLevel: 5,
      icon: '🍀',
      type: 'permanent'
    },
    {
      id: 'comboMultiplier',
      name: 'Combo Multiplier',
      description: 'Earn 5% more coins for each consecutive day you play (stacks based on level)',
      baseCost: 180,
      maxLevel: 3,
      icon: '🔄',
      type: 'permanent'
    },
    {
      id: 'doubleCoins',
      name: 'Double Coins',
      description: 'Double all coins earned for 5 minutes. Stacks to increase duration!',
      baseCost: 50,
      maxLevel: 1,
      icon: '2️⃣',
      type: 'timed'
    },
    {
      id: 'luckyStreak',
      name: 'Lucky Streak',
      description: '25% chance to earn triple coins for 5 minutes. Stacks to increase duration!',
      baseCost: 75,
      maxLevel: 1,
      icon: '🎲',
      type: 'timed'
    }
  ];
  
  // Add user's current level for each powerup
  const powerupsWithLevels = availablePowerups.map(powerup => {
    const result = {
      ...powerup,
      currentLevel: user.powerups[powerup.id] || 0
    };
    
    if (powerup.type === 'permanent') {
      result.currentCost = calculatePowerupCost(powerup.baseCost, user.powerups[powerup.id] || 0);
    } else {
      result.currentCost = powerup.baseCost;
      
      // Add active status and remaining time for timed powerups
      if (user.activePowerups && user.activePowerups[powerup.id]) {
        const activePowerup = user.activePowerups[powerup.id];
        const now = new Date();
        const expiryDate = new Date(activePowerup.expiresAt);
        
        if (expiryDate > now) {
          const remainingMs = expiryDate.getTime() - now.getTime();
          const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
          
          result.active = true;
          result.remainingMinutes = remainingMinutes;
          result.stackCount = activePowerup.stackCount || 1;
          result.expiresAt = activePowerup.expiresAt;
        } else {
          result.active = false;
        }
      } else {
        result.active = false;
      }
    }
    
    return result;
  });
  
  res.json({
    success: true,
    powerups: powerupsWithLevels
  });
});

app.post('/api/coins/purchase/powerup', (req, res) => {
  const token = req.header('x-auth-token');
  const { powerupId } = req.body;
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Initialize powerups if not exists
  if (!user.powerups) {
    user.powerups = {};
  }
  
  if (!powerupId) {
    return res.status(400).json({ success: false, message: 'Powerup ID is required' });
  }
  
  // Define available powerups
  const availablePowerups = {
    coinBoost: { baseCost: 100, maxLevel: 5 },
    autoClicker: { baseCost: 200, maxLevel: 3 },
    luckyFinder: { baseCost: 150, maxLevel: 5 },
    coinRate: { baseCost: 150, maxLevel: 4 },
    comboMultiplier: { baseCost: 180, maxLevel: 3 },
    doubleCoins: { baseCost: 50, maxLevel: 1 },
    luckyStreak: { baseCost: 75, maxLevel: 1 }
  };
  
  // Check if powerup exists
  if (!availablePowerups[powerupId]) {
    return res.status(400).json({ success: false, message: 'Invalid powerup ID' });
  }
  
  const powerup = availablePowerups[powerupId];
  const currentLevel = user.powerups[powerupId] || 0;
  
  // Check if powerup is already at max level
  if (currentLevel >= powerup.maxLevel) {
    return res.status(400).json({ success: false, message: 'Powerup already at maximum level' });
  }
  
  // Calculate cost based on current level
  const cost = calculatePowerupCost(powerup.baseCost, currentLevel);
  
  // Check if user has enough coins
  if (user.coins < cost) {
    return res.status(400).json({ success: false, message: `Not enough coins. This powerup costs ${cost} coins.` });
  }
  
  // Deduct coins and upgrade powerup
  user.coins -= cost;
  user.powerups[powerupId] = currentLevel + 1;
  
  // Get updated level
  const newLevel = user.powerups[powerupId];
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: `Successfully upgraded ${powerupId} to level ${newLevel}`,
    remainingCoins: user.coins,
    powerupId,
    newLevel,
    nextLevelCost: newLevel < powerup.maxLevel ? calculatePowerupCost(powerup.baseCost, newLevel) : null
  });
});

// Activate timed powerup
app.post('/api/coins/activate-powerup', (req, res) => {
  const token = req.header('x-auth-token');
  const { powerupId } = req.body;
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Check if powerup ID is valid
  const validTimedPowerups = ['doubleCoins', 'luckyStreak'];
  if (!validTimedPowerups.includes(powerupId)) {
    return res.status(400).json({ success: false, message: 'Invalid powerup ID' });
  }
  
  // Define cost for each powerup
  const powerupCosts = {
    doubleCoins: 50,
    luckyStreak: 75
  };
  
  const cost = powerupCosts[powerupId];
  
  // Check if user has enough coins
  if (user.coins < cost) {
    return res.status(400).json({ success: false, message: `Not enough coins. This powerup costs ${cost} coins.` });
  }
  
  // Initialize activePowerups if not exists
  if (!user.activePowerups) {
    user.activePowerups = {};
  }
  
  // Get current time
  const now = new Date();
  
  // Calculate duration and stack count
  let durationMinutes = 5; // Base duration is 5 minutes
  let stackCount = 1;
  
  // Check if powerup is already active
  if (user.activePowerups[powerupId]) {
    const currentPowerup = user.activePowerups[powerupId];
    const expiryDate = new Date(currentPowerup.expiresAt);
    
    if (expiryDate > now) {
      // Powerup is still active, stack the duration
      stackCount = (currentPowerup.stackCount || 1) + 1;
      
      // Increase duration based on stack count
      // After 5 stacks, each new stack adds 10 minutes instead of 5
      durationMinutes = stackCount <= 5 ? 
        5 * stackCount : 
        5 * 5 + (stackCount - 5) * 10;
      
      // Add the new duration to the remaining time
      const remainingMs = expiryDate.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      durationMinutes += remainingMinutes;
    }
  }
  
  // Calculate expiry time
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  
  // Update the powerup
  user.activePowerups[powerupId] = {
    activatedAt: now,
    expiresAt: expiresAt,
    durationMinutes: durationMinutes,
    stackCount: stackCount
  };
  
  // Deduct coins
  user.coins -= cost;
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: `Successfully activated ${powerupId} powerup`,
    remainingCoins: user.coins,
    powerup: {
      id: powerupId,
      activatedAt: now,
      expiresAt: expiresAt,
      durationMinutes: durationMinutes,
      stackCount: stackCount,
      remainingMinutes: durationMinutes
    }
  });
});

// Get active powerups
app.get('/api/coins/active-powerups', (req, res) => {
  const token = req.header('x-auth-token');
  
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  const userId = token.replace('demo-token-', '');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Initialize activePowerups if not exists
  if (!user.activePowerups) {
    user.activePowerups = {};
  }
  
  // Get current time
  const now = new Date();
  
  // Filter active powerups
  const activePowerups = {};
  for (const [powerupId, powerup] of Object.entries(user.activePowerups)) {
    const expiryDate = new Date(powerup.expiresAt);
    if (expiryDate > now) {
      const remainingMs = expiryDate.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      
      activePowerups[powerupId] = {
        ...powerup,
        remainingMinutes: remainingMinutes
      };
    }
  }
  
  res.json({
    success: true,
    activePowerups: activePowerups
  });
});

// Helper function to calculate powerup cost based on level
function calculatePowerupCost(baseCost, currentLevel) {
  // Each level increases the cost by 50%
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

// Admin API Routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check if the user exists and is an admin or owner
  const user = users.find(u => u.username === username && u.password === password && 
                         (u.role === 'admin' || u.role === 'owner' || username.toLowerCase().includes('admin')));
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
  
  // Ensure user has admin role (for backward compatibility)
  if (!user.role) {
    user.role = 'admin';
    saveUsers();
  }
  
  // Generate admin token (in a real app, you would use JWT with proper signing)
  const adminToken = `admin-token-${user.id}`;
  
  res.json({
    success: true,
    token: adminToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// Get all users (admin only)
app.get('/api/admin/users', (req, res) => {
  const token = req.header('x-admin-token');
  
  if (!token || !token.startsWith('admin-token-')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  
  // Verify admin token
  const adminId = token.replace('admin-token-', '');
  const adminUser = users.find(u => u.id === adminId && 
                              (u.role === 'admin' || u.role === 'owner' || u.username.toLowerCase().includes('admin')));
  
  if (!adminUser) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
  
  // Return all users
  res.json({
    success: true,
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      coins: user.coins,
      unlockedThemes: user.unlockedThemes,
      unlockedParticles: user.unlockedParticles,
      powerups: user.powerups || {},
      password: user.password,
      passwordHistory: user.passwordHistory || [],
      selectedTheme: user.selectedTheme,
      selectedParticles: user.selectedParticles,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }))
  });
});

// Update user (admin only)
app.put('/api/admin/users/:userId', (req, res) => {
  const token = req.header('x-admin-token');
  const { userId } = req.params;
  const { username, email, coins, password, role, unlockedThemes, unlockedParticles, powerups, activePowerups } = req.body;
  
  if (!token || !token.startsWith('admin-token-')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  
  // Verify admin token
  const adminId = token.replace('admin-token-', '');
  const adminUser = users.find(u => u.id === adminId && 
                              (u.role === 'admin' || u.role === 'owner' || u.username.toLowerCase().includes('admin')));
  
  if (!adminUser) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
  
  // Find the user to update
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  const userToUpdate = users[userIndex];
  
  // Check permissions based on roles
  if (adminUser.role === 'admin') {
    // Admins can't modify owners or other admins
    if (userToUpdate.role === 'owner' || userToUpdate.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admins cannot modify owner or other admin accounts' 
      });
    }
    
    // Admins can't promote users to admin or owner
    if (role === 'admin' || role === 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admins cannot promote users to admin or owner roles' 
      });
    }
  } else if (adminUser.role !== 'owner') {
    // If not an owner or admin with special permissions, deny access
    return res.status(403).json({ 
      success: false, 
      message: 'Insufficient permissions to modify users' 
    });
  }
  
  // Check if username or email already exists (excluding the current user)
  const existingUser = users.find(u => 
    u.id !== userId && (u.username === username || u.email === email)
  );
  
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Username or email already exists' });
  }
  
  // Update user
  const user = users[userIndex];
  
  user.username = username || user.username;
  user.email = email || user.email;
  user.coins = coins !== undefined ? coins : user.coins;
  
  // Only update role if allowed (owners can change roles, admins can only change regular users)
  if (role && (adminUser.role === 'owner' || (adminUser.role === 'admin' && user.role === 'user'))) {
    user.role = role;
  }
  
  // Only update password if allowed and provided
  if (password && (adminUser.role === 'owner' || (adminUser.role === 'admin' && user.role === 'user'))) {
    // Store the current password in history before updating
    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }
    user.passwordHistory.push(user.password);
    
    // Keep only the last 5 passwords in history
    if (user.passwordHistory.length > 5) {
      user.passwordHistory = user.passwordHistory.slice(-5);
    }
    
    user.password = password;
  }
  
  // Update unlocked themes if provided
  if (unlockedThemes && Array.isArray(unlockedThemes)) {
    user.unlockedThemes = unlockedThemes;
    
    // Make sure selectedTheme is in unlockedThemes
    if (!unlockedThemes.includes(user.selectedTheme)) {
      user.selectedTheme = unlockedThemes[0] || 'default';
    }
  }
  
  // Update unlocked particles if provided
  if (unlockedParticles && Array.isArray(unlockedParticles)) {
    user.unlockedParticles = unlockedParticles;
    
    // Make sure selectedParticles are in unlockedParticles
    if (user.selectedParticles && Array.isArray(user.selectedParticles)) {
      user.selectedParticles = user.selectedParticles.filter(p => unlockedParticles.includes(p));
    }
  }
  
  // Update powerups if provided
  if (powerups && typeof powerups === 'object') {
    user.powerups = powerups;
  }
  
  // Update active powerups if provided
  if (activePowerups && typeof activePowerups === 'object') {
    // Initialize activePowerups if not exists
    if (!user.activePowerups) {
      user.activePowerups = {};
    }
    
    // Process each active powerup
    for (const [powerupId, powerupData] of Object.entries(activePowerups)) {
      if (powerupData.stackCount > 0 || powerupData.durationMinutes > 0) {
        // Calculate new expiry time based on current time and duration
        const now = new Date();
        const expiryDate = new Date(now.getTime() + (powerupData.durationMinutes * 60 * 1000));
        
        user.activePowerups[powerupId] = {
          activatedAt: now.toISOString(),
          expiresAt: expiryDate.toISOString(),
          durationMinutes: powerupData.durationMinutes,
          stackCount: powerupData.stackCount
        };
      } else {
        // Remove the powerup if stack count and duration are 0
        delete user.activePowerups[powerupId];
      }
    }
  }
  
  saveUsers(); // Save users to file
  
  res.json({
    success: true,
    message: 'User updated successfully'
  });
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', (req, res) => {
  const token = req.header('x-admin-token');
  const { userId } = req.params;
  
  if (!token || !token.startsWith('admin-token-')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  
  // Verify admin token
  const adminId = token.replace('admin-token-', '');
  const adminUser = users.find(u => u.id === adminId && 
                              (u.role === 'admin' || u.role === 'owner' || u.username.toLowerCase().includes('admin')));
  
  if (!adminUser) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
  
  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  
  // Find the user to delete
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  const userToDelete = users[userIndex];
  
  // Check permissions based on roles
  if (adminUser.role === 'admin') {
    // Admins can't delete owners or other admins
    if (userToDelete.role === 'owner' || userToDelete.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admins cannot delete owner or other admin accounts' 
      });
    }
  } else if (adminUser.role !== 'owner') {
    // If not an owner or admin with special permissions, deny access
    return res.status(403).json({ 
      success: false, 
      message: 'Insufficient permissions to delete users' 
    });
  }
  
  // Delete user
  users.splice(userIndex, 1);
  
  // Save changes
  saveUsers();
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

app.use(express.static(path.join(__dirname, "static")));
app.use("/fq", cors({ origin: true }));

const routes = [
  { path: "/yz", file: "apps.html" },
  { path: "/up", file: "games.html" },
  { path: "/play.html", file: "games.html" },
  { path: "/vk", file: "settings.html" },
  { path: "/rx", file: "tabs.html" },
  { path: "/", file: "index.html" },
  { path: "/lg", file: "account.html" },
];

// biome-ignore lint/complexity/noForEach:
routes.forEach(route => {
  app.get(route.path, (_req, res) => {
    res.sendFile(path.join(__dirname, "static", route.file));
  });
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "static", "404.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, "static", "404.html"));
});

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(PORT, () => {
  console.log(chalk.green(`Server running at http://localhost:${PORT}/`));
});
