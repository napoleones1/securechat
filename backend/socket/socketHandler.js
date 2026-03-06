const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Store online users
const onlineUsers = new Map();

module.exports = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.userId})`);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    // Update user status
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      socketId: socket.id,
      lastSeen: Date.now()
    });

    // Broadcast user online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      status: 'online'
    });

    // Join user's chat rooms
    const userChats = await Chat.find({ participants: socket.userId });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType, fileUrl, fileName, fileSize } = data;

        // Verify user is in chat OR user is admin
        const chat = await Chat.findById(chatId);
        const isAdmin = socket.user.role === 'admin';
        
        if (!chat || (!chat.participants.includes(socket.userId) && !isAdmin)) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Create message
        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize,
          status: 'sent',
          isAdminMessage: socket.user.role === 'admin'
        });

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.updatedAt = Date.now();
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', '-password');

        // Emit to all users in chat
        io.to(chatId).emit('message:new', populatedMessage);

        // Mark as delivered for online recipients
        const onlineRecipients = chat.participants.filter(
          p => p.toString() !== socket.userId && onlineUsers.has(p.toString())
        );

        if (onlineRecipients.length > 0) {
          message.status = 'delivered';
          message.deliveredTo = onlineRecipients.map(userId => ({
            user: userId,
            deliveredAt: Date.now()
          }));
          await message.save();

          // Notify sender about delivery
          socket.emit('message:delivered', {
            messageId: message._id,
            status: 'delivered'
          });
        }

        // Send notification to offline users
        const offlineParticipants = chat.participants.filter(
          p => p.toString() !== socket.userId && !onlineUsers.has(p.toString())
        );

        // TODO: Implement push notifications for offline users
        
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      console.log('Typing start received:', data);
      socket.to(data.chatId).emit('typing:user', {
        chatId: data.chatId,
        userId: socket.userId,
        username: socket.user.name || socket.user.username
      });
    });

    socket.on('typing:stop', (data) => {
      console.log('Typing stop received:', data);
      socket.to(data.chatId).emit('typing:stop', {
        chatId: data.chatId,
        userId: socket.userId
      });
    });

    // Handle message read
    socket.on('message:read', async (data) => {
      try {
        const { messageId, chatId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) return;

        const alreadyRead = message.readBy.some(
          r => r.user.toString() === socket.userId
        );

        if (!alreadyRead) {
          message.readBy.push({ user: socket.userId });
          message.status = 'read';
          await message.save();

          // Notify sender
          io.to(chatId).emit('message:read', {
            messageId,
            userId: socket.userId,
            readAt: Date.now()
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle mark messages as delivered when user joins chat
    socket.on('messages:delivered', async (data) => {
      try {
        const { chatId } = data;
        
        // Find undelivered messages in this chat
        const messages = await Message.find({
          chat: chatId,
          sender: { $ne: socket.userId },
          status: 'sent'
        });

        for (const message of messages) {
          const alreadyDelivered = message.deliveredTo.some(
            d => d.user.toString() === socket.userId
          );

          if (!alreadyDelivered) {
            message.deliveredTo.push({ user: socket.userId });
            message.status = 'delivered';
            await message.save();

            // Notify sender
            io.to(chatId).emit('message:delivered', {
              messageId: message._id,
              userId: socket.userId,
              status: 'delivered'
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle join chat room
    socket.on('chat:join', (chatId) => {
      socket.join(chatId);
      console.log(`✅ User ${socket.user.username} joined chat ${chatId}`);
      
      // Confirm join to client
      socket.emit('chat:joined', { chatId });
    });

    // Handle leave chat room
    socket.on('chat:leave', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.user.username} left chat ${chatId}`);
    });
    
    // WebRTC Call Signaling Events
    socket.on('call:initiate', (data) => {
      const { receiverId, chatId, callId, type } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call:incoming', {
          callId,
          caller: {
            id: socket.userId,
            name: socket.user.name || socket.user.username,
            avatar: socket.user.avatar
          },
          chatId,
          type: type || 'voice'
        });
        console.log(`📞 Call initiated from ${socket.user.username} to ${receiverId}`);
      } else {
        socket.emit('call:failed', { message: 'User is offline' });
      }
    });

    socket.on('call:answer', (data) => {
      const { callerId, callId } = data;
      const callerSocketId = onlineUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:answered', {
          callId,
          answerer: {
            id: socket.userId,
            name: socket.user.name || socket.user.username
          }
        });
        console.log(`✅ Call answered by ${socket.user.username}`);
      }
    });

    socket.on('call:reject', (data) => {
      const { callerId, callId } = data;
      const callerSocketId = onlineUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:rejected', { callId });
        console.log(`❌ Call rejected by ${socket.user.username}`);
      }
    });

    socket.on('call:end', (data) => {
      const { otherUserId, callId } = data;
      const otherSocketId = onlineUsers.get(otherUserId);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit('call:ended', { callId });
      }
      console.log(`📴 Call ended by ${socket.user.username}`);
    });

    // WebRTC Signaling
    socket.on('webrtc:offer', (data) => {
      const { receiverId, offer, callId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('webrtc:offer', {
          callId,
          offer,
          senderId: socket.userId
        });
      }
    });

    socket.on('webrtc:answer', (data) => {
      const { callerId, answer, callId } = data;
      const callerSocketId = onlineUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('webrtc:answer', {
          callId,
          answer,
          senderId: socket.userId
        });
      }
    });

    socket.on('webrtc:ice-candidate', (data) => {
      const { otherUserId, candidate, callId } = data;
      const otherSocketId = onlineUsers.get(otherUserId);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit('webrtc:ice-candidate', {
          callId,
          candidate,
          senderId: socket.userId
        });
      }
    });
    
    // Handle system message broadcast
    socket.on('system:message', (data) => {
      console.log('Broadcasting system message:', data);
      // Broadcast to all users in the chat except sender
      socket.to(data.chatId).emit('system:message', data);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username}`);

      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Update user status
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        socketId: null,
        lastSeen: Date.now()
      });

      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: Date.now()
      });
    });
  });

  // Return online users count
  setInterval(() => {
    io.emit('stats:online', {
      count: onlineUsers.size
    });
  }, 30000); // Every 30 seconds
};
