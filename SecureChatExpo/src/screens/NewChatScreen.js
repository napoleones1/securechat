import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Colors from '../styles/colors';
import api from '../services/api';

const NewChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchUsers();
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      const response = await api.get(`/users/search?q=${searchQuery}`);
      // Filter out current user
      const filteredUsers = (response.data || []).filter(u => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (selectedUser) => {
    try {
      const response = await api.post('/chats', {
        participants: [selectedUser._id],
        isGroupChat: false,
      });

      if (response.success) {
        navigation.replace('Chat', { chat: response.data });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => createChat(item)}>
      <Avatar
        uri={item.avatar}
        name={item.name}
        size={50}
        online={item.status === 'online'}
      />
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.isVerified && (
            <Icon name="check-decagram" size={16} color={Colors.VERIFIED} />
          )}
          {item.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={styles.userUsername}>{item.username}</Text>
        {item.bio && (
          <Text style={styles.userBio} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
      </View>
      <Icon name="chevron-right" size={24} color={Colors.TEXT_TERTIARY} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={Colors.TEXT_SECONDARY} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name, username, or email..."
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      {/* New Group Button */}
      <TouchableOpacity
        style={styles.newGroupButton}
        onPress={() => navigation.navigate('NewGroup')}>
        <View style={styles.groupIcon}>
          <Icon name="account-multiple" size={24} color={Colors.TEXT_WHITE} />
        </View>
        <Text style={styles.newGroupText}>New Group</Text>
        <Icon name="chevron-right" size={24} color={Colors.TEXT_TERTIARY} />
      </TouchableOpacity>

      {/* Users List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-search" size={64} color={Colors.TEXT_TERTIARY} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No users found' : 'Search for users'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try a different search term'
              : 'Enter name, username, or email'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={renderUserItem}
        />
      )}
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
  newGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.BG_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newGroupText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginLeft: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginRight: 5,
  },
  adminBadge: {
    backgroundColor: Colors.ADMIN,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 5,
  },
  adminText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.TEXT_WHITE,
  },
  userUsername: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    color: Colors.TEXT_TERTIARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    textAlign: 'center',
  },
});

export default NewChatScreen;
