class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    const token = await api.getToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    // Load socket.io client from CDN
    if (!window.io) {
      await this.loadSocketIO();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    return this.socket;
  }

  loadSocketIO() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  sendMessage(data) {
    this.emit('message:send', data);
  }

  joinChat(chatId) {
    this.emit('chat:join', chatId);
    // Mark messages as delivered when joining
    this.emit('messages:delivered', { chatId });
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

const socketService = new SocketService();
