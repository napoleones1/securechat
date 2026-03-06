import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  socket = null;
  listeners = new Map();

  async connect() {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Chat methods
  sendMessage(data) {
    this.emit('message:send', data);
  }

  joinChat(chatId) {
    this.emit('chat:join', chatId);
  }

  leaveChat(chatId) {
    this.emit('chat:leave', chatId);
  }

  startTyping(chatId) {
    this.emit('typing:start', { chatId });
  }

  stopTyping(chatId) {
    this.emit('typing:stop', { chatId });
  }

  markAsRead(messageId, chatId) {
    this.emit('message:read', { messageId, chatId });
  }
}

export default new SocketService();
