import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../styles/colors';

const GroupInfoScreen = ({ route, navigation }) => {
  const { chatId } = route.params;
  const { user: currentUser } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [groupBio, setGroupBio] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);

  useEffect(() => {
    loadGroupInfo();
  }, [chatId]);

  const loadGroupInfo = async () => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      if (response.success) {
        setChat(response.data);
        setGroupName(response.data.name || '');
        setGroupBio(response.data.bio || '');
      }
    } catch (error) {
      console.error('Error loading group info:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    if (!chat || !currentUser) return false;
    return chat.admins?.some(admin => admin._id === currentUser._id);
  };

  const pickImage = () => {
    if (!isAdmin()) {
      Alert.alert('Permission Denied', 'Only admins can change group photo');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          setGroupAvatar(response.assets[0]);
          setEditing(true);
        }
      }
    );
  };

  const handleSave = async () => {
    if (!isAdmin()) {
      Alert.alert('Permission Denied', 'Only admins can edit group info');
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', groupName.trim());
      formData.append('bio', groupBio.trim());

      if (groupAvatar) {
        formData.append('avatar', {
          uri: groupAvatar.uri,
          type: groupAvatar.type,
          name: groupAvatar.fileName || 'group-avatar.jpg',
        });
      }

      const response = await api.put(`/chats/${chatId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        setChat(response.data);
        setEditing(false);
        setGroupAvatar(null);
        Alert.alert('Success', 'Group info updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update group info');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = () => {
    if (!isAdmin()) {
      Alert.alert('Permission Denied', 'Only admins can add members');
      return;
    }
    navigation.navigate('NewGroup', { chatId, mode: 'add' });
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin()) {
      Alert.alert('Permission Denied', 'Only admins can remove members');
      return;
    }

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.post(`/chats/${chatId}/remove-member`, {
                userId: memberId,
              });
              if (response.success) {
                loadGroupInfo();
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handlePromoteMember = async (memberId) => {
    if (!isAdmin()) {
      Alert.alert('Permission Denied', 'Only admins can promote members');
      return;
    }

    try {
      const response = await api.post(`/chats/${chatId}/promote`, {
        userId: memberId,
      });
      if (response.success) {
        loadGroupInfo();
        Alert.alert('Success', 'Member promoted to admin');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to promote member');
    }
  };

  const handleDemoteMember = async (memberId) => {
    if (!isAdmin()) {
      Alert.alert('Permission Denied', 'Only admins can demote members');
      return;
    }

    try {
      const response = await api.post(`/chats/${chatId}/demote`, {
        userId: memberId,
      });
      if (response.success) {
        loadGroupInfo();
        Alert.alert('Success', 'Admin demoted to member');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to demote member');
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.post(`/chats/${chatId}/leave`);
              if (response.success) {
                navigation.navigate('ChatsListScreen');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const getAvatarUrl = () => {
    if (groupAvatar) return groupAvatar.uri;
    if (chat?.avatar) return chat.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.name || 'Group')}&background=075E54&color=fff&size=200`;
  };

  const renderMember = ({ item }) => {
    const isGroupAdmin = chat?.admins?.some(admin => admin._id === item._id);
    const isCurrentUser = item._id === currentUser._id;
    const canManage = isAdmin() && !isCurrentUser;

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => {
          if (!isCurrentUser) {
            navigation.navigate('UserInfo', { userId: item._id });
          }
        }}
        onLongPress={() => {
          if (canManage) {
            Alert.alert(
              item.name || item.username,
              'Choose an action',
              [
                {
                  text: isGroupAdmin ? 'Demote from Admin' : 'Promote to Admin',
                  onPress: () => isGroupAdmin ? handleDemoteMember(item._id) : handlePromoteMember(item._id),
                },
                {
                  text: 'Remove from Group',
                  style: 'destructive',
                  onPress: () => handleRemoveMember(item._id),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }
        }}
      >
        <Image
          source={{
            uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || item.username)}&background=075E54&color=fff`,
          }}
          style={styles.memberAvatar}
        />
        <View style={styles.memberInfo}>
          <View style={styles.memberNameContainer}>
            <Text style={styles.memberName}>
              {item.name || item.username}
              {isCurrentUser && ' (You)'}
            </Text>
            {item.isVerified && (
              <Icon name="check-decagram" size={16} color={Colors.PRIMARY} />
            )}
          </View>
          <Text style={styles.memberRole}>
            {isGroupAdmin ? 'Admin' : 'Member'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-group-outline" size={64} color={Colors.TEXT_TERTIARY} />
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.TEXT_WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Info</Text>
        {editing ? (
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.TEXT_WHITE} />
            ) : (
              <Icon name="check" size={24} color={Colors.TEXT_WHITE} />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} disabled={!isAdmin()}>
            <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
            {isAdmin() && (
              <View style={styles.avatarOverlay}>
                <Icon name="camera" size={32} color={Colors.TEXT_WHITE} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          {editing && isAdmin() ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                  style={styles.input}
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Enter group name"
                  placeholderTextColor={Colors.TEXT_TERTIARY}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Group Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={groupBio}
                  onChangeText={setGroupBio}
                  placeholder="Enter group bio"
                  placeholderTextColor={Colors.TEXT_TERTIARY}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.groupName}>{chat.name}</Text>
                {isAdmin() && (
                  <TouchableOpacity onPress={() => setEditing(true)}>
                    <Icon name="pencil" size={20} color={Colors.PRIMARY} />
                  </TouchableOpacity>
                )}
              </View>
              {chat.bio && (
                <Text style={styles.groupBio}>{chat.bio}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.membersTitle}>
              {chat.participants?.length || 0} Members
            </Text>
            {isAdmin() && (
              <TouchableOpacity onPress={handleAddMember}>
                <Icon name="account-plus" size={24} color={Colors.PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={chat.participants}
            renderItem={renderMember}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>

        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
          <Icon name="exit-to-app" size={20} color={Colors.ERROR} />
          <Text style={styles.leaveButtonText}>Leave Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BG_PRIMARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BG_PRIMARY,
  },
  errorText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_WHITE,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.BG_SECONDARY,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 16,
    backgroundColor: Colors.BG_SECONDARY,
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  groupBio: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  membersSection: {
    marginTop: 10,
    backgroundColor: Colors.BG_SECONDARY,
    paddingVertical: 10,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.TEXT_PRIMARY,
    marginRight: 4,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.TEXT_TERTIARY,
    marginTop: 2,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ERROR,
    marginLeft: 8,
  },
});

export default GroupInfoScreen;
