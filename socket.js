import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function setupSocketIO(server) {
  const io = new Server(server);
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);
    
    // Join user to their own room for private messages
    socket.join(socket.user._id.toString());
    
    // Handle joining a chat with a friend
    socket.on('join', async (data) => {
      try {
        const { userId, friendId } = data;
        
        // Verify users are friends
        const user = await User.findById(userId);
        if (!user) return;
        
        const isFriend = user.friends.some(friend => friend.toString() === friendId);
        if (!isFriend) return;
        
        // Create a unique room name for this conversation
        // Sort IDs to ensure the same room name regardless of who initiates
        const roomName = [userId, friendId].sort().join('-');
        
        // Join the room
        socket.join(roomName);
        console.log(`User ${userId} joined room ${roomName}`);
      } catch (error) {
        console.error('Error joining chat room:', error);
      }
    });
    
    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content } = data;
        
        if (!content || content.trim() === '') return;
        
        // Create and save the message
        const newMessage = new Message({
          sender: socket.user._id,
          recipient: recipientId,
          content: content.trim()
        });
        
        await newMessage.save();
        
        // Create a unique room name for this conversation
        const roomName = [socket.user._id.toString(), recipientId].sort().join('-');
        
        // Emit the message to the room
        io.to(roomName).emit('new_message', newMessage);
        
        // Also emit to recipient's personal room in case they're not in the chat room
        io.to(recipientId).emit('new_message_notification', {
          message: newMessage,
          sender: {
            _id: socket.user._id,
            username: socket.user.username
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      const { recipientId } = data;
      const roomName = [socket.user._id.toString(), recipientId].sort().join('-');
      
      socket.to(roomName).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });
    
    // Handle stop typing
    socket.on('stop_typing', (data) => {
      const { recipientId } = data;
      const roomName = [socket.user._id.toString(), recipientId].sort().join('-');
      
      socket.to(roomName).emit('user_stop_typing', {
        userId: socket.user._id
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user._id})`);
    });
  });
  
  return io;
}