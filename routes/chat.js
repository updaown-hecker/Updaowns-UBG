import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

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

// Get chat history with a specific friend
router.get('/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    
    // Verify friend exists and is actually a friend
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }
    
    // Check if they are friends
    if (!req.user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not friends with this user'
      });
    }
    
    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: friendId },
        { sender: friendId, recipient: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { sender: friendId, recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting chat history'
    });
  }
});

// Send a message to a friend
router.post('/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Verify friend exists and is actually a friend
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }
    
    // Check if they are friends
    if (!req.user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not friends with this user'
      });
    }
    
    // Create and save the message
    const newMessage = new Message({
      sender: req.user.id,
      recipient: friendId,
      content
    });
    
    await newMessage.save();
    
    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting unread count'
    });
  }
});

export default router;