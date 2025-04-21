import mongoose from 'mongoose';

const FriendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);

export default FriendRequest;