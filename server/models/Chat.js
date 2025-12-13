const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  receiverType: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

const chatSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  doctorId: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    doctor: {
      type: Number,
      default: 0
    },
    patient: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Method to update last message
chatSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = message.content;
  this.lastMessageTime = new Date();
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Message, Chat };