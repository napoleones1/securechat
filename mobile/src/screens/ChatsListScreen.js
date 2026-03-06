import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/Avatar';
import Colors from '../styles/colors';
import api from '../services/api';

const ChatsListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { connected, on, off } = useSocket();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();

    // Socket listeners for real-time updates
    on('message:new', handleNewMessage);
    on('message:delivered', handleMessageUpdate);
    on('message:read', handleMessageUpdate);

    return () => {
      off('message:new', handleNewMessage);
      off('message:delivered', handleMessageUpdate);
      off('message:read', handleMessageUpdate);
    };
  }, []);

  const loadChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNewMessage = (message) => {
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c._id === message.chat);
      if (chatIndex !== -1) {
        const updatedChats = [...prevChats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: message,
          updatedAt: message.createdAt,
        };
        // Move to top
        const [chat] = updatedChats.splice(chatIndex, 1);
        return [chat, ...updatedChats];
      }
      return prevChats;
    });
  };

  const handleMessageUpdate = (data) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.lastMessage?._id === data.messageId
          ? {
              ...chat,
              lastMessage: {
                ...chat.lastMessage,
                status: data.status || chat.lastMessage.status,
              },
            }
          : chat
      )
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'dd/MM/yy');
    }
  };

  const getMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    
    switch (message.messageType) {
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      case 'voice':
        return '🎤 Voice message';
      case 'file':
        return '📎 File';
      default:
        return message.content || 'Message';
    }
  };

  const getMessageStatus = (message) => {
    if (!message || message.sender?._id !== user?._id) return null;
    
    let icon = 'check';
    let color = Colors.STATUS_SENT;

    if (message.status === 'delivered') {
      icon = 'check-all';
      color = Colors.STATUS_DELIVERED;
    } else if (message.status === 'read') {
      icon = 'check-all';
      color = Colors.STATUS_READ;
    }

    return <Icon name={icon} size={16} color={color} style={{ marginRight: 5 }} />;
  };

  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroupChat
      ? chat.name
      : chat.participants?.find(p => p._id !== user?._id)?.name || '';
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderChatItem = ({ item }) => {
    const otherUser = item.isGroupChat
      ? null
      : item.participants?.find(p => p._id !== user?._id);
    const chatName = item.isGroupChat ? item.name : otherUser?.name || 'Unknown';
    const chatAvatar = item.isGroupChat ? item.avatar : otherUser?.avatar;
    const isOnline = !item.isGroupChat && otherUser?.status === 'online';
    const lastMessage = item.lastMessage;
    const unreadCount = item.unreadCount || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', { chat: item })}>
        <Avatar
          uri={chatAvatar}
          name={chatName}
          size={50}
          online={isOnline}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {chatName}
            </Text>
            <Text style={styles.chatTime}>
              {formatTime(lastMessage?.createdAt || item.updatedAt)}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            {getMessageStatus(lastMessage)}
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}>
              {getMessagePreview(lastMessage)}
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

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

      {/* Connection Status */}
      {!connected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Connecting...</Text>
        </View>
      )}

      {/* Chat List */}
      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="message-text-outline" size={64} color={Colors.TEXT_TERTIARY} />
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubtext}>Tap + to start a new chat</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item._id}
          renderItem={renderChatItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.PRIMARY]}
            />
          }
        />
      )}

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  offlineBanner: {
    backgroundColor: Colors.WARNING,
    paddingVertical: 5,
    alignItems: 'center',
  },
  offlineText: {
    color: Colors.TEXT_WHITE,
    fontSize: 12,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.BG_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  unreadMessage: {
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  unreadBadge: {
    backgroundColor: Colors.ACCENT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 5,
  },
  unreadText: {
    color: Colors.TEXT_WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
