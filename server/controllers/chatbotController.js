const { chatWithGemini } = require('../config/gemini');
const ChatLog = require('../models/ChatLog');

// Chat with bot
const chatWithBot = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const currentSessionId = sessionId || `session_${Date.now()}`;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Message:', message);
    console.log('🆔 Session:', currentSessionId);

    // Find or create chat log
    let chatLog = await ChatLog.findOne({ sessionId: currentSessionId });

    if (!chatLog) {
      chatLog = new ChatLog({
        sessionId: currentSessionId,
        messages: []
      });
      console.log('📝 New chat created');
    }

    // Get last 5 messages for context
    const recentMessages = chatLog.messages.slice(-5);
    let history = [];
    
    if (recentMessages.length > 0) {
      history = recentMessages.map(m => ({
        role: m.role,
        content: m.content
      }));
    }

    // Save user message
    chatLog.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get Gemini response
    console.log('🤖 Calling Gemini...');
    const botResponse = await chatWithGemini(message, history);
    console.log('✅ Gemini response received');

    // Save bot response
    chatLog.messages.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date()
    });

    await chatLog.save();

    res.json({
      success: true,
      message: botResponse,
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sorry, I\'m having trouble connecting. Please try again.'
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.json({ success: true, messages: [] });
    }

    const chatLog = await ChatLog.findOne({ sessionId });

    if (!chatLog) {
      return res.json({ success: true, messages: [] });
    }

    // Format messages for frontend
    const formattedMessages = chatLog.messages.map(msg => ({
      id: msg._id || Date.now(),
      text: msg.content,
      sender: msg.role === 'user' ? 'user' : 'bot',
      time: new Date(msg.timestamp).toLocaleTimeString()
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Clear chat history
const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    await ChatLog.deleteOne({ sessionId });

    res.json({ success: true, message: 'History cleared' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
};

module.exports = {
  chatWithBot,
  getChatHistory,
  clearChatHistory
};