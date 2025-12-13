const { Message, Chat } = require('../models/Chat');

// Get messages for appointment
exports.getMessages = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.query;
    
    const messages = await Message.find({ appointmentId })
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read for the requesting user
    if (userId) {
      await Message.updateMany(
        { 
          appointmentId, 
          receiverId: userId,
          read: false 
        },
        { read: true }
      );

      // Reset unread count in chat
      const userType = userId.startsWith('doctor') ? 'doctor' : 'patient';
      await Chat.findOneAndUpdate(
        { appointmentId },
        { $set: { [`unreadCount.${userType}`]: 0 } }
      );
    }

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { appointmentId, senderId, receiverId, content, senderType, receiverType } = req.body;

    // Validate input
    if (!appointmentId || !content || !senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create message
    const message = new Message({
      appointmentId,
      senderId,
      senderType,
      receiverId,
      receiverType,
      content,
      read: false
    });

    await message.save();

    // Update or create chat with increment for unread count
    await Chat.findOneAndUpdate(
      { appointmentId },
      {
        appointmentId,
        doctorId: senderType === 'doctor' ? senderId : receiverId,
        patientId: senderType === 'patient' ? senderId : receiverId,
        lastMessage: content.substring(0, 100), // Truncate long messages
        lastMessageTime: new Date(),
        $inc: {
          [`unreadCount.${receiverType}`]: 1
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const chats = await Chat.find({
      [userType === 'doctor' ? 'doctorId' : 'patientId']: userId
    });

    const totalUnread = chats.reduce((sum, chat) => 
      sum + (chat.unreadCount[userType] || 0), 0
    );

    res.json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

// Get all chats for a user
exports.getChats = async (req, res) => {
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
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats'
    });
  }
};

// Check for new messages
exports.checkNewMessages = async (req, res) => {
  try {
    const { appointmentId, lastMessageId } = req.query;
    
    const query = { appointmentId };
    if (lastMessageId) {
      query._id = { $gt: lastMessageId };
    }
    
    const newMessages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(50);
    
    res.json({
      success: true,
      messages: newMessages,
      hasNew: newMessages.length > 0
    });
  } catch (error) {
    console.error('Error checking new messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check new messages'
    });
  }
};