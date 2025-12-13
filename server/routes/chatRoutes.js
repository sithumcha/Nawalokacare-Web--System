const express = require("express");
const router = express.Router();
const { Message, Chat } = require("../models/Chat");

// Get messages for an appointment
router.get("/messages/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.query;
    
    console.log(`📨 Fetching messages for appointment: ${appointmentId}`);
    
    const messages = await Message.find({ appointmentId })
      .sort({ createdAt: 1 })
      .limit(100);
    
    console.log(`✅ Found ${messages.length} messages in database`);
    
    res.json({
      success: true,
      messages: messages,
      count: messages.length
    });
  } catch (error) {
    console.error("❌ Error fetching messages from database:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages"
    });
  }
});

// Send a new message
router.post("/send", async (req, res) => {
  console.log("📤 Received HTTP send message request");
  
  try {
    const { appointmentId, senderId, receiverId, content, senderType, receiverType } = req.body;

    // Validate input
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        error: "appointmentId is required"
      });
    }
    
    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message content is required"
      });
    }

    // Create new message in database
    const newMessage = new Message({
      appointmentId: appointmentId.toString(),
      senderId: senderId || "unknown",
      senderType: senderType || 'doctor',
      receiverId: receiverId || "unknown",
      receiverType: receiverType || 'patient',
      content: content.trim(),
      read: false
    });

    // Save to database
    await newMessage.save();
    console.log("✅ Message saved to database:", newMessage._id);

    // Update or create chat in database
    await Chat.findOneAndUpdate(
      { appointmentId: appointmentId.toString() },
      {
        appointmentId: appointmentId.toString(),
        doctorId: senderType === 'doctor' ? senderId : receiverId,
        patientId: senderType === 'patient' ? senderId : receiverId,
        lastMessage: content.trim().substring(0, 100),
        lastMessageTime: new Date(),
        $inc: {
          [`unreadCount.${receiverType || 'patient'}`]: 1
        }
      },
      { upsert: true, new: true }
    );

    console.log("✅ Chat updated in database");

    // Return success response
    res.status(201).json({
      success: true,
      message: "Message sent and saved to database",
      data: newMessage
    });

  } catch (error) {
    console.error("❌ Error saving message to database:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save message to database",
      message: error.message
    });
  }
});

// Get unread message count
router.get("/unread/:userId/:userType", async (req, res) => {
  try {
    const { userId, userType } = req.params;
    console.log(`🔔 Getting unread count for ${userType}: ${userId}`);
    
    const chats = await Chat.find({
      [userType === 'doctor' ? 'doctorId' : 'patientId']: userId
    });
    
    const totalUnread = chats.reduce((sum, chat) => {
      return sum + (chat.unreadCount[userType] || 0);
    }, 0);
    
    console.log(`✅ Found ${totalUnread} unread messages in database`);
    
    res.json({
      success: true,
      unreadCount: totalUnread,
      chats: chats.map(chat => ({
        appointmentId: chat.appointmentId,
        unreadCount: chat.unreadCount[userType] || 0
      }))
    });
  } catch (error) {
    console.error("Error getting unread count from database:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get unread count"
    });
  }
});

// Get all chats for a user
router.get("/chats/:userId/:userType", async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    const chats = await Chat.find({
      [userType === 'doctor' ? 'doctorId' : 'patientId']: userId
    })
    .sort({ lastMessageTime: -1 })
    .limit(50);
    
    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check for new messages (polling endpoint)
router.get("/poll/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { lastMessageId, lastCheck } = req.query;
    
    let query = { appointmentId };
    
    // If lastMessageId is provided, get messages after that ID
    if (lastMessageId) {
      query._id = { $gt: lastMessageId };
    }
    // Otherwise, if lastCheck timestamp is provided, get messages after that time
    else if (lastCheck) {
      query.createdAt = { $gt: new Date(parseInt(lastCheck)) };
    }
    
    const newMessages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(50);
    
    // Get updated unread count for the user if userId is provided
    let unreadCount = 0;
    if (req.query.userId && req.query.userType) {
      const chat = await Chat.findOne({ appointmentId });
      if (chat) {
        unreadCount = chat.unreadCount[req.query.userType] || 0;
      }
    }
    
    res.json({
      success: true,
      messages: newMessages,
      hasNew: newMessages.length > 0,
      lastMessageId: newMessages.length > 0 ? newMessages[newMessages.length - 1]._id : lastMessageId,
      unreadCount
    });
    
  } catch (error) {
    console.error("Error polling for messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to poll for messages"
    });
  }
});

// Mark messages as read
router.post("/mark-read", async (req, res) => {
  try {
    const { appointmentId, userId, userType } = req.body;
    
    await Message.updateMany(
      { 
        appointmentId, 
        receiverId: userId,
        read: false 
      },
      { read: true }
    );

    // Update unread count in chat
    await Chat.findOneAndUpdate(
      { appointmentId },
      { $set: { [`unreadCount.${userType}`]: 0 } }
    );

    res.json({
      success: true,
      message: "Messages marked as read"
    });
    
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark messages as read"
    });
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const messageCount = await Message.countDocuments();
    const chatCount = await Chat.countDocuments();
    
    res.json({
      success: true,
      message: "Chat API is running",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        messages: messageCount,
        chats: chatCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Chat API is running but database connection failed",
      error: error.message
    });
  }
});

module.exports = router;