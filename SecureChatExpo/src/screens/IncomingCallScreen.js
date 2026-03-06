import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import Colors from '../styles/colors';

const { width } = Dimensions.get('window');

const IncomingCallScreen = ({ route, navigation }) => {
  const { callId, caller, callType } = route.params;
  const { user } = useAuth();
  const socket = useSocket();
  
  const [callerInfo, setCallerInfo] = useState(caller);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Load caller info
    loadCallerInfo();

    // Listen for call ended
    if (socket) {
      socket.on('call:ended', handleCallEnded);
      socket.on('call:cancelled', handleCallCancelled);
    }

    return () => {
      if (socket) {
        socket.off('call:ended', handleCallEnded);
        socket.off('call:cancelled', handleCallCancelled);
      }
    };
  }, []);

  const loadCallerInfo = async () => {
    try {
      const response = await api.get(`/users/${caller._id}`);
      if (response.success) {
        setCallerInfo(response.data);
      }
    } catch (error) {
      console.error('Error loading caller info:', error);
    }
  };

  const handleCallEnded = () => {
    navigation.goBack();
  };

  const handleCallCancelled = () => {
    navigation.goBack();
  };

  const handleAccept = async () => {
    try {
      // Accept call
      const response = await api.post(`/calls/${callId}/accept`);
      
      if (response.success) {
        // Emit socket event
        socket.emit('call:accept', { callId });
        
        // Navigate to call screen
        navigation.replace('Call', {
          userId: caller._id,
          callType,
          isOutgoing: false,
          callId,
        });
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      navigation.goBack();
    }
  };

  const handleReject = async () => {
    try {
      // Reject call
      await api.post(`/calls/${callId}/reject`);
      
      // Emit socket event
      socket.emit('call:reject', { callId });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error rejecting call:', error);
      navigation.goBack();
    }
  };

  const getAvatarUrl = () => {
    if (callerInfo?.avatar) return callerInfo.avatar;
    const displayName = callerInfo?.name || callerInfo?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=075E54&color=fff&size=400`;
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} />

      {/* Caller Info */}
      <View style={styles.callerInfo}>
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
        </Animated.View>

        <Text style={styles.callerName}>
          {callerInfo?.name || callerInfo?.username}
        </Text>
        
        <View style={styles.badgesContainer}>
          {callerInfo?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={20} color={Colors.TEXT_WHITE} />
            </View>
          )}
          {callerInfo?.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>

        <Text style={styles.callType}>
          {callType === 'video' ? 'Video Call' : 'Voice Call'}
        </Text>
        
        <Text style={styles.callStatus}>Incoming call...</Text>
      </View>

      {/* Call Actions */}
      <View style={styles.actions}>
        {/* Reject Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <View style={styles.actionButtonInner}>
            <Icon name="phone-hangup" size={32} color={Colors.TEXT_WHITE} />
          </View>
          <Text style={styles.actionLabel}>Decline</Text>
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
        >
          <View style={styles.actionButtonInner}>
            <Icon
              name={callType === 'video' ? 'video' : 'phone'}
              size={32}
              color={Colors.TEXT_WHITE}
            />
          </View>
          <Text style={styles.actionLabel}>Accept</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="message-text" size={24} color={Colors.TEXT_WHITE} />
          <Text style={styles.quickActionLabel}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="clock-outline" size={24} color={Colors.TEXT_WHITE} />
          <Text style={styles.quickActionLabel}>Remind Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.PRIMARY,
    opacity: 0.95,
  },
  callerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  callerName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.TEXT_WHITE,
    marginBottom: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  adminBadge: {
    backgroundColor: Colors.ERROR,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.TEXT_WHITE,
  },
  callType: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingBottom: 80,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  rejectButton: {},
  acceptButton: {},
  rejectButton: {
    backgroundColor: Colors.ERROR,
  },
  acceptButton: {
    backgroundColor: Colors.ACCENT,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_WHITE,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    paddingBottom: 40,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
});

export default IncomingCallScreen;
