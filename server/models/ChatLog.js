const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);