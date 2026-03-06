import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../styles/colors';

const UserInfoScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, [userId]);

  const loadUserInfo = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const response = await api.post('/chats', {
        participants: [userId],
        isGroupChat: false,
      });
      if (response.success) {
        navigation.navigate('Chat', { chatId: response.data._id });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleVoiceCall = () => {
    navigation.navigate('Call', {
      userId,
      callType: 'voice',
      isOutgoing: true,
    });
  };

  const handleVideoCall = () => {
    navigation.navigate('Call', {
      userId,
      callType: 'video',
      isOutgoing: true,
    });
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    const displayName = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=075E54&color=fff&size=200`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="account-off" size={64} color={Colors.TEXT_TERTIARY} />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.TEXT_WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Info</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity>
            <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user.name || user.username}</Text>
            <View style={styles.badgesContainer}>
              {user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.TEXT_WHITE} />
                </View>
              )}
              {user.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <MaterialCommunityIcons name="message-text" size={24} color={Colors.TEXT_WHITE} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleVoiceCall}>
            <MaterialCommunityIcons name="phone" size={24} color={Colors.TEXT_WHITE} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
            <MaterialCommunityIcons name="video" size={24} color={Colors.TEXT_WHITE} />
            <Text style={styles.actionText}>Video</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="information" size={20} color={Colors.TEXT_SECONDARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>
                {user.bio || 'No bio available'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="email" size={20} color={Colors.TEXT_SECONDARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </View>
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  verifiedBadge: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  adminBadge: {
    backgroundColor: Colors.ERROR,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.TEXT_WHITE,
  },
  username: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 5,
  },
  bio: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: Colors.BG_SECONDARY,
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: Colors.TEXT_WHITE,
    marginTop: 4,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 10,
    backgroundColor: Colors.BG_SECONDARY,
    paddingVertical: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.TEXT_TERTIARY,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
  },
});

export default UserInfoScreen;
