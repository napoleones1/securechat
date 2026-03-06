import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Colors from '../styles/colors';
import api from '../services/api';

const NewGroupScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [groupBio, setGroupBio] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    searchUsers();
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/search?q=${searchQuery}`);
      const filteredUsers = (response.data || []).filter(u => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (selectedUser) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === selectedUser._id);
      if (exists) {
        return prev.filter(u => u._id !== selectedUser._id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const pickGroupAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setGroupAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter group name');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setCreating(true);
    try {
      let avatarUrl = null;

      // Upload avatar if selected
      if (groupAvatar) {
        const formData = new FormData();
        formData.append('file', {
          uri: groupAvatar.uri,
          type: groupAvatar.type,
          name: groupAvatar.fileName,
        });

        const uploadResponse = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = uploadResponse.fileUrl;
      }

      // Create group
      const response = await api.post('/chats/group', {
        name: groupName.trim(),
        bio: groupBio.trim(),
        avatar: avatarUrl,
        participants: selectedUsers.map(u => u._id),
      });

      if (response.success) {
        Alert.alert('Success', 'Group created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('Chat', { chat: response.data });
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const renderSelectedUser = ({ item }) => (
    <View style={styles.selectedUserChip}>
      <Avatar uri={item.avatar} name={item.name} size={30} />
      <Text style={styles.selectedUserName} numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => toggleUserSelection(item)}>
        <MaterialCommunityIcons name="close-circle" size={20} color={Colors.TEXT_SECONDARY} />
      </TouchableOpacity>
    </View>
  );

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.find(u => u._id === item._id);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item)}>
        <Avatar
          uri={item.avatar}
          name={item.name}
          size={45}
          online={item.status === 'online'}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>{item.username}</Text>
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={18} color={Colors.TEXT_WHITE} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Group Info Section */}
        <View style={styles.groupInfoSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickGroupAvatar}>
            {groupAvatar ? (
              <Avatar uri={groupAvatar.uri} name={groupName} size={80} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="camera" size={32} color={Colors.TEXT_SECONDARY} />
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Group Name (required)"
            placeholderTextColor={Colors.TEXT_SECONDARY}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />

          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Group Bio (optional)"
            placeholderTextColor={Colors.TEXT_SECONDARY}
            value={groupBio}
            onChangeText={setGroupBio}
            multiline
            maxLength={200}
          />
        </View>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>
              Selected Members ({selectedUsers.length})
            </Text>
            <FlatList
              horizontal
              data={selectedUsers}
              keyExtractor={item => item._id}
              renderItem={renderSelectedUser}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedList}
            />
          </View>
        )}

        {/* Search Users */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Add Members</Text>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Users List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item._id}
            renderItem={renderUserItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search" size={48} color={Colors.TEXT_TERTIARY} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No users found' : 'Search for users to add'}
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          (!groupName.trim() || selectedUsers.length === 0 || creating) &&
            styles.createButtonDisabled,
        ]}
        onPress={createGroup}
        disabled={!groupName.trim() || selectedUsers.length === 0 || creating}>
        {creating ? (
          <ActivityIndicator color={Colors.TEXT_WHITE} />
        ) : (
          <>
            <MaterialCommunityIcons name="check" size={24} color={Colors.TEXT_WHITE} />
            <Text style={styles.createButtonText}>Create Group</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
  },
  groupInfoSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: Colors.BG_SECONDARY,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.BG_SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 10,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectedSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 10,
  },
  selectedList: {
    paddingVertical: 5,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 20,
    paddingRight: 10,
    paddingLeft: 5,
    paddingVertical: 5,
    marginRight: 10,
    maxWidth: 120,
  },
  selectedUserName: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    marginHorizontal: 8,
    flex: 1,
  },
  searchSection: {
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.TEXT_TERTIARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.TEXT_TERTIARY,
    marginTop: 10,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  createButtonDisabled: {
    backgroundColor: Colors.TEXT_TERTIARY,
  },
  createButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default NewGroupScreen;

