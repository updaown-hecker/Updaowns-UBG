import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

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

// Get friends list
router.get('/', auth, async (req, res) => {
  try {
    // Assuming User model has a friends array with user IDs
    const user = await User.findById(req.user.id).populate('friends', 'username coins');
    
    res.json({
      success: true,
      friends: user.friends || []
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting friends list' 
    });
  }
});

// Get pending friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.user.id,
      status: 'pending'
    }).populate('sender', 'username');
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting friend requests' 
    });
  }
});

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Check if user exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already friends with this user' 
      });
    }
    
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
      ],
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Friend request already exists' 
      });
    }
    
    // Create new friend request
    const newRequest = new FriendRequest({
      sender: req.user.id,
      recipient: userId,
      status: 'pending'
    });
    
    await newRequest.save();
    
    res.json({
      success: true,
      message: 'Friend request sent',
      request: newRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error sending friend request' 
    });
  }
});

// Accept friend request
router.post('/accept/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the request
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friend request not found' 
      });
    }
    
    // Check if user is the recipient
    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to accept this request' 
      });
    }
    
    // Update request status
    request.status = 'accepted';
    await request.save();
    
    // Add to friends list for both users
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { friends: request.sender }
    });
    
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: req.user.id }
    });
    
    res.json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error accepting friend request' 
    });
  }
});

// Decline friend request
router.post('/decline/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the request
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friend request not found' 
      });
    }
    
    // Check if user is the recipient
    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to decline this request' 
      });
    }
    
    // Update request status
    request.status = 'declined';
    await request.save();
    
    res.json({
      success: true,
      message: 'Friend request declined'
    });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error declining friend request' 
    });
  }
});

// Remove friend
router.delete('/remove/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    
    // Remove from both users' friends lists
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { friends: friendId }
    });
    
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user.id }
    });
    
    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error removing friend' 
    });
  }
});

export default router;