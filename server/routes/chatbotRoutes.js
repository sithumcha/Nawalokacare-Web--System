const express = require('express');
const router = express.Router();
const {
  chatWithBot,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatbotController');

// Public routes
router.post('/chat', chatWithBot);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;