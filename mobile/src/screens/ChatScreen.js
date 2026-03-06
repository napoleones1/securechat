import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import Avatar from '../components/Avatar';
import Colors from '../styles/colors';
import api from '../services/api';

const ChatScreen = ({ route, navigation }) => {
  const { chat } = route.params;
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  const otherUser = chat.isGroupChat
    ? null
    : chat.participants?.find(p => p._id !== user?._id);

  useEffect(() => {
    // Set header
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitle}
          onPress={() => {
            if (chat.isGroupChat) {
              navigation.navigate('GroupInfo', { chat });
            } else {
              navigation.navigate('UserInfo', { user: otherUser });
            }
          }}>
          <Avatar
            uri={chat.isGroupChat ? chat.avatar : otherUser?.avatar}
            name={chat.isGroupChat ? chat.name : otherUser?.name}
            size={35}
            online={!chat.isGroupChat && otherUser?.status === 'online'}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {chat.isGroupChat ? chat.name : otherUser?.name}
            </Text>
            <Text style={styles.headerStatus} numberOfLines={1}>
              {chat.isGroupChat
                ? `${chat.participants?.length || 0} members`
                : otherUser?.status === 'online'
                ? 'Online'
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
                style={styles.headerButton}
                onPress={() => initiateCall('voice')}>
                <Icon name="phone" size={24} color={Colors.TEXT_WHITE} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => initiateCall('video')}>
                <Icon name="video" size={24} color={Colors.TEXT_WHITE} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.headerButton} onPress={showMenu}>
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
      setMessages(response.data?.reverse() || []);
      markMessagesAsRead();
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
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
      setTypingUser(data.username);
      setTimeout(() => setTyping(false), 3000);
    }
  };

  const handleTypingStop = (data) => {
    if (data.chatId === chat._id) {
      setTyping(false);
      setTypingUser(null);
    }
  };

  const handleMessageDelivered = (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId ? { ...msg, status: 'delivered' } : msg
      )
    );
  };

  const handleMessageRead = (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId ? { ...msg, status: 'read' } : msg
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

        fileUrl = uploadResponse.fileUrl;
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
      Alert.alert('Error', 'Failed to send message');
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

  const showMenu = () => {
    Alert.alert(
      'Chat Options',
      '',
      [
        { text: 'Clear Chat', onPress: () => Alert.alert('Coming Soon') },
        { text: 'Block User', onPress: () => Alert.alert('Coming Soon') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Icon name="message-text-outline" size={64} color={Colors.TEXT_TERTIARY} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          )
        }
      />

      {/* Typing Indicator */}
      {typing && <TypingIndicator username={typingUser} />}

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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
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
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_TERTIARY,
    marginTop: 5,
  },
});

export default ChatScreen;
