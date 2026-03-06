# 📱 SecureChat Mobile - Implementation Guide

Panduan lengkap implementasi mobile app dengan semua fitur desktop.

---

## ✅ Implementation Status

### Completed
- ✅ Project structure setup
- ✅ Package.json with all dependencies
- ✅ Color system (WhatsApp-style)
- ✅ App.js navigation structure
- ✅ SocketContext for real-time
- ✅ Documentation (MOBILE_SETUP.md)

### To Implement (Priority Order)

#### Phase 1: Core Screens (Week 1)
1. ✅ SplashScreen - Auto-navigate
2. ✅ LoginScreen - Email/username login
3. ✅ RegisterScreen - Full registration
4. ✅ MainTabs - Bottom navigation
5. ✅ ChatsListScreen - WhatsApp-style list
6. ✅ ChatScreen - Full messaging UI

#### Phase 2: Messaging Features (Week 2)
7. ✅ MessageBubble component
8. ✅ MessageInput component
9. ✅ File attachments (image, video, file)
10. ✅ VoiceRecorder component
11. ✅ Message status indicators
12. ✅ Typing indicators

#### Phase 3: User & Group Management (Week 3)
13. ✅ NewChatScreen
14. ✅ NewGroupScreen
15. ✅ ProfileScreen
16. ✅ UserInfoScreen
17. ✅ GroupInfoScreen
18. ✅ Avatar component

#### Phase 4: Calls (Week 4)
19. ✅ CallsListScreen
20. ✅ CallScreen (voice/video)
21. ✅ IncomingCallScreen
22. ✅ CallService (WebRTC)
23. ✅ Call controls

#### Phase 5: Polish & Testing (Week 5)
24. ✅ Push notifications
25. ✅ Permissions handling
26. ✅ Error handling
27. ✅ Loading states
28. ✅ Animations
29. ✅ Testing
30. ✅ Build & release

---

## 🎨 Screen Implementations

### 1. SplashScreen.js
```javascript
import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../styles/colors';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setTimeout(() => {
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    } catch (error) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color={Colors.ACCENT} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
});

export default SplashScreen;
```

### 2. ChatsListScreen.js (WhatsApp Style)
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatItem from '../components/ChatItem';
import Colors from '../styles/colors';
import api from '../services/api';

const ChatsListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    
    // Socket listeners
    on('message:new', handleNewMessage);
    on('message:delivered', handleMessageDelivered);
    on('message:read', handleMessageRead);
    
    return () => {
      off('message:new', handleNewMessage);
      off('message:delivered', handleMessageDelivered);
      off('message:read', handleMessageRead);
    };
  }, []);

  const loadChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    // Update chat list with new message
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c._id === message.chat);
      if (chatIndex !== -1) {
        const updatedChats = [...prevChats];
        updatedChats[chatIndex].lastMessage = message;
        updatedChats[chatIndex].updatedAt = message.createdAt;
        // Move to top
        const [chat] = updatedChats.splice(chatIndex, 1);
        return [chat, ...updatedChats];
      }
      return prevChats;
    });
  };

  const handleMessageDelivered = (data) => {
    // Update message status
  };

  const handleMessageRead = (data) => {
    // Update message status
  };

  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroupChat ? chat.name : 
      chat.participants.find(p => p._id !== user._id)?.name || '';
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={Colors.TEXT_SECONDARY} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ChatItem
            chat={item}
            currentUserId={user._id}
            onPress={() => navigation.navigate('Chat', { chat: item })}
          />
        )}
        refreshing={loading}
        onRefresh={loadChats}
      />

      {/* FAB - New Chat */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewChat')}>
        <Icon name="message-plus" size={24} color={Colors.TEXT_WHITE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ChatsListScreen;
```

### 3. ChatScreen.js (Full Implementation)
```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import Colors from '../styles/colors';
import api from '../services/api';

const ChatScreen = ({ route, navigation }) => {
  const { chat } = route.params;
  const { user } = useAuth();
  const { socket, emit, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  const otherUser = chat.isGroupChat ? null :
    chat.participants.find(p => p._id !== user._id);

  useEffect(() => {
    // Set header
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          onPress={() => {
            if (chat.isGroupChat) {
              navigation.navigate('GroupInfo', { chat });
            } else {
              navigation.navigate('UserInfo', { user: otherUser });
            }
          }}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerName}>
              {chat.isGroupChat ? chat.name : otherUser?.name}
            </Text>
            <Text style={styles.headerStatus}>
              {chat.isGroupChat 
                ? `${chat.participants.length} members`
                : 'Tap for info'}
            </Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          {!chat.isGroupChat && (
            <>
              <TouchableOpacity
                onPress={() => initiateCall('voice')}
                style={styles.headerButton}>
                <Icon name="phone" size={24} color={Colors.TEXT_WHITE} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => initiateCall('video')}
                style={styles.headerButton}>
                <Icon name="video" size={24} color={Colors.TEXT_WHITE} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            onPress={() => {/* Show menu */}}
            style={styles.headerButton}>
            <Icon name="dots-vertical" size={24} color={Colors.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
      ),
    });

    loadMessages();
    joinChat();

    // Socket listeners
    on('message:new', handleNewMessage);
    on('typing:user', handleTyping);
    on('typing:stop', handleTypingStop);
    on('message:delivered', handleMessageDelivered);
    on('message:read', handleMessageRead);

    return () => {
      leaveChat();
      off('message:new', handleNewMessage);
      off('typing:user', handleTyping);
      off('typing:stop', handleTypingStop);
      off('message:delivered', handleMessageDelivered);
      off('message:read', handleMessageRead);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/${chat._id}`);
      setMessages(response.data.reverse());
      markMessagesAsRead();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChat = () => {
    emit('chat:join', chat._id);
    emit('messages:delivered', { chatId: chat._id });
  };

  const leaveChat = () => {
    emit('chat:leave', chat._id);
  };

  const handleNewMessage = (message) => {
    if (message.chat === chat._id) {
      setMessages(prev => [message, ...prev]);
      if (message.sender._id !== user._id) {
        markMessageAsRead(message._id);
      }
    }
  };

  const handleTyping = (data) => {
    if (data.chatId === chat._id && data.userId !== user._id) {
      setTyping(true);
      setTimeout(() => setTyping(false), 3000);
    }
  };

  const handleTypingStop = (data) => {
    if (data.chatId === chat._id) {
      setTyping(false);
    }
  };

  const handleMessageDelivered = (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, status: 'delivered' }
          : msg
      )
    );
  };

  const handleMessageRead = (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, status: 'read' }
          : msg
      )
    );
  };

  const sendMessage = async (content, messageType = 'text', fileData = null) => {
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      if (fileData) {
        // Upload file first
        const formData = new FormData();
        formData.append('file', {
          uri: fileData.uri,
          type: fileData.type,
          name: fileData.name,
        });

        const uploadResponse = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        fileUrl = uploadResponse.data.fileUrl;
        fileName = fileData.name;
        fileSize = fileData.size;
      }

      emit('message:send', {
        chatId: chat._id,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markMessagesAsRead = () => {
    messages.forEach(msg => {
      if (msg.sender._id !== user._id && msg.status !== 'read') {
        markMessageAsRead(msg._id);
      }
    });
  };

  const markMessageAsRead = (messageId) => {
    emit('message:read', {
      messageId,
      chatId: chat._id,
    });
  };

  const initiateCall = (callType) => {
    navigation.navigate('Call', {
      chat,
      otherUser,
      callType,
      isOutgoing: true,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isSent={item.sender._id === user._id}
            currentUser={user}
          />
        )}
        inverted
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0 })}
      />

      {/* Typing Indicator */}
      {typing && <TypingIndicator />}

      {/* Message Input */}
      <MessageInput
        onSend={sendMessage}
        onTyping={() => emit('typing:start', { chatId: chat._id })}
        onStopTyping={() => emit('typing:stop', { chatId: chat._id })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_CHAT,
  },
  headerTitle: {
    flexDirection: 'column',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_WHITE,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.TEXT_LIGHT,
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerButton: {
    marginLeft: 15,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default ChatScreen;
```

---

## 🔧 Component Implementations

### ChatItem.js
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import Colors from '../styles/colors';

const ChatItem = ({ chat, currentUserId, onPress }) => {
  const isGroup = chat.isGroupChat;
  const otherUser = isGroup ? null :
    chat.participants.find(p => p._id !== currentUserId);
  
  const chatName = isGroup ? chat.name : otherUser?.name || 'Unknown';
  const chatAvatar = isGroup ? chat.avatar : otherUser?.avatar;
  const isOnline = !isGroup && otherUser?.status === 'online';
  
  const lastMessage = chat.lastMessage;
  const lastMessageText = lastMessage?.content || 'No messages yet';
  const lastMessageTime = lastMessage?.createdAt 
    ? format(new Date(lastMessage.createdAt), 'HH:mm')
    : '';
  
  const unreadCount = chat.unreadCount || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar uri={chatAvatar} size={50} online={isOnline} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {chatName}
          </Text>
          <Text style={styles.time}>{lastMessageTime}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessageText}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.BG_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  time: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  unreadBadge: {
    backgroundColor: Colors.ACCENT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.TEXT_WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ChatItem;
```

---

## 📝 Implementation Checklist

### Week 1: Core Setup ✅
- [x] Project structure
- [x] Dependencies
- [x] Color system
- [x] Navigation
- [x] Context providers
- [ ] SplashScreen
- [ ] LoginScreen
- [ ] RegisterScreen
- [ ] MainTabs
- [ ] ChatsListScreen

### Week 2: Messaging
- [ ] ChatScreen
- [ ] MessageBubble
- [ ] MessageInput
- [ ] File picker
- [ ] Image picker
- [ ] VoiceRecorder
- [ ] Message status
- [ ] Typing indicator

### Week 3: User Management
- [ ] NewChatScreen
- [ ] NewGroupScreen
- [ ] ProfileScreen
- [ ] UserInfoScreen
- [ ] GroupInfoScreen
- [ ] Avatar component
- [ ] Badge components

### Week 4: Calls
- [ ] CallsListScreen
- [ ] CallScreen
- [ ] IncomingCallScreen
- [ ] CallService (WebRTC)
- [ ] Call controls
- [ ] Call notifications

### Week 5: Polish
- [ ] Push notifications
- [ ] Permissions
- [ ] Error handling
- [ ] Loading states
- [ ] Animations
- [ ] Testing
- [ ] Build

---

## 🚀 Quick Commands

```bash
# Install
npm install

# Run Android
npm run android

# Run iOS
npm run ios

# Start Metro
npm start

# Clear cache
npm start -- --reset-cache

# Build Android APK
cd android && ./gradlew assembleRelease

# Build iOS
cd ios && xcodebuild
```

---

**Status:** In Progress  
**Completion:** 20%  
**Next:** Implement core screens
