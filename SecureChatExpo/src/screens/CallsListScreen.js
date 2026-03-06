import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../styles/colors';

const CallsListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const response = await api.get('/calls');
      if (response.success) {
        setCalls(response.data);
      }
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalls();
  };

  const handleCallPress = (call) => {
    const otherUser = call.participants.find(p => p._id !== user._id);
    if (otherUser) {
      navigation.navigate('Call', {
        userId: otherUser._id,
        callType: call.callType,
        isOutgoing: true,
      });
    }
  };

  const formatCallTime = (date) => {
    const callDate = new Date(date);
    if (isToday(callDate)) {
      return format(callDate, 'HH:mm');
    } else if (isYesterday(callDate)) {
      return 'Yesterday';
    } else {
      return format(callDate, 'dd/MM/yyyy');
    }
  };

  const getCallIcon = (call) => {
    const isOutgoing = call.caller._id === user._id;
    const isMissed = call.status === 'missed';
    const isVideo = call.callType === 'video';

    if (isMissed) {
      return {
        name: isVideo ? 'video-off' : 'phone-missed',
        color: Colors.ERROR,
      };
    }

    if (isOutgoing) {
      return {
        name: isVideo ? 'video-outline' : 'phone-outgoing',
        color: Colors.ACCENT,
      };
    }

    return {
      name: isVideo ? 'video-outline' : 'phone-incoming',
      color: Colors.PRIMARY,
    };
  };

  const getCallDuration = (call) => {
    if (call.status === 'missed' || call.status === 'rejected') {
      return call.status.charAt(0).toUpperCase() + call.status.slice(1);
    }

    if (!call.duration) return 'No answer';

    const minutes = Math.floor(call.duration / 60);
    const seconds = call.duration % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getAvatarUrl = (user) => {
    if (user?.avatar) return user.avatar;
    const displayName = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=075E54&color=fff&size=200`;
  };

  const renderCall = ({ item }) => {
    const otherUser = item.participants.find(p => p._id !== user._id);
    if (!otherUser) return null;

    const callIcon = getCallIcon(item);
    const isOutgoing = item.caller._id === user._id;

    return (
      <TouchableOpacity
        style={styles.callItem}
        onPress={() => handleCallPress(item)}
      >
        <Image
          source={{ uri: getAvatarUrl(otherUser) }}
          style={styles.avatar}
        />
        <View style={styles.callInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{otherUser.name || otherUser.username}</Text>
            {otherUser.isVerified && (
              <Icon name="check-decagram" size={16} color={Colors.PRIMARY} />
            )}
          </View>
          <View style={styles.callDetails}>
            <Icon
              name={callIcon.name}
              size={16}
              color={callIcon.color}
              style={styles.callIcon}
            />
            <Text style={[styles.callStatus, { color: callIcon.color }]}>
              {getCallDuration(item)}
            </Text>
          </View>
        </View>
        <View style={styles.callActions}>
          <Text style={styles.callTime}>{formatCallTime(item.createdAt)}</Text>
          <TouchableOpacity
            onPress={() => handleCallPress(item)}
            style={styles.callButton}
          >
            <Icon
              name={item.callType === 'video' ? 'video' : 'phone'}
              size={24}
              color={Colors.PRIMARY}
            />
          </TouchableOpacity>
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

  if (calls.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="phone-outline" size={64} color={Colors.TEXT_TERTIARY} />
          <Text style={styles.emptyText}>No calls yet</Text>
          <Text style={styles.emptySubtext}>Call history will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={calls}
        renderItem={renderCall}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
          />
        }
      />
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
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.BG_SECONDARY,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.TEXT_PRIMARY,
    marginRight: 4,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  callIcon: {
    marginRight: 4,
  },
  callStatus: {
    fontSize: 14,
  },
  callActions: {
    alignItems: 'flex-end',
  },
  callTime: {
    fontSize: 12,
    color: Colors.TEXT_TERTIARY,
    marginBottom: 8,
  },
  callButton: {
    padding: 4,
  },
});

export default CallsListScreen;
