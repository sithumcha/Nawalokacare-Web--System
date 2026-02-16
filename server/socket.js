// const socketIo = require('socket.io');
// const { Message, Chat } = require('./models/Chat');

// let io;

// const initializeSocket = (server) => {
//   io = socketIo(server, {
//     cors: {
//       origin: "http://localhost:3000",
//       methods: ["GET", "POST"],
//       credentials: true
//     },
//     transports: ['websocket', 'polling']
//   });

//   io.on('connection', (socket) => {
//     console.log('✅ New client connected:', socket.id);

//     // Join specific chat room
//     socket.on('joinChat', (appointmentId) => {
//       socket.join(appointmentId);
//       console.log(`Client ${socket.id} joined room: ${appointmentId}`);
//     });

//     // Leave chat room
//     socket.on('leaveChat', (appointmentId) => {
//       socket.leave(appointmentId);
//       console.log(`Client ${socket.id} left room: ${appointmentId}`);
//     });

//     // Handle sending messages
//     socket.on('sendMessage', async (messageData) => {
//       try {
//         console.log('📨 Message received from client:', socket.id);
//         console.log('Message data:', JSON.stringify(messageData, null, 2));

//         // Validate message data
//         if (!messageData.appointmentId || !messageData.content) {
//           socket.emit('error', { message: 'Missing required fields' });
//           return;
//         }

//         // Create and save message
//         const message = new Message({
//           appointmentId: messageData.appointmentId,
//           senderId: messageData.senderId || 'unknown',
//           senderType: messageData.senderType || 'doctor',
//           receiverId: messageData.receiverId || 'unknown',
//           receiverType: messageData.receiverType || 'patient',
//           content: messageData.content,
//           read: false
//         });

//         const savedMessage = await message.save();
//         console.log('✅ Message saved to database:', savedMessage._id);

//         // Update or create chat record
//         await Chat.findOneAndUpdate(
//           { appointmentId: messageData.appointmentId },
//           {
//             appointmentId: messageData.appointmentId,
//             doctorId: messageData.senderType === 'doctor' ? messageData.senderId : messageData.receiverId,
//             patientId: messageData.senderType === 'patient' ? messageData.senderId : messageData.receiverId,
//             lastMessage: messageData.content.substring(0, 100), // Truncate long messages
//             lastMessageTime: new Date(),
//             $inc: {
//               [`unreadCount.${messageData.receiverType}`]: 1
//             }
//           },
//           { upsert: true, new: true }
//         );

//         // Prepare response
//         const responseMessage = {
//           _id: savedMessage._id,
//           appointmentId: savedMessage.appointmentId,
//           senderId: savedMessage.senderId,
//           senderType: savedMessage.senderType,
//           receiverId: savedMessage.receiverId,
//           receiverType: savedMessage.receiverType,
//           content: savedMessage.content,
//           read: savedMessage.read,
//           timestamp: savedMessage.createdAt
//         };

//         // Broadcast to everyone in the room
//         io.to(messageData.appointmentId).emit('newMessage', responseMessage);
//         console.log('📢 Message broadcasted to room:', messageData.appointmentId);

//       } catch (error) {
//         console.error('❌ Error saving/broadcasting message:', error);
//         socket.emit('error', { 
//           message: 'Failed to send message', 
//           error: error.message 
//         });
//       }
//     });

//     // Mark messages as read
//     socket.on('markAsRead', async (data) => {
//       try {
//         const { appointmentId, userId } = data;
        
//         await Message.updateMany(
//           { 
//             appointmentId, 
//             receiverId: userId,
//             read: false 
//           },
//           { read: true }
//         );

//         // Update unread count in chat
//         const userType = userId.startsWith('doctor') ? 'doctor' : 'patient';
//         await Chat.findOneAndUpdate(
//           { appointmentId },
//           { $set: { [`unreadCount.${userType}`]: 0 } }
//         );

//         console.log(`📭 Messages marked as read for ${userId} in appointment ${appointmentId}`);
//       } catch (error) {
//         console.error('❌ Error marking messages as read:', error);
//       }
//     });

//     socket.on('disconnect', (reason) => {
//       console.log(`❌ Client disconnected: ${socket.id} (Reason: ${reason})`);
//     });

//     socket.on('error', (error) => {
//       console.error('❌ Socket error:', error);
//     });
//   });

//   return io;
// };

// const getIo = () => {
//   if (!io) {
//     throw new Error('Socket.io not initialized!');
//   }
//   return io;
// };

// module.exports = { initializeSocket, getIo };