import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RTCView } from 'react-native-webrtc';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import Colors from '../styles/colors';

const { width, height } = Dimensions.get('window');

const CallScreen = ({ route, navigation }) => {
  const { userId, callType, isOutgoing, callId } = route.params;
  const { user } = useAuth();
  const socket = useSocket();
  
  const [otherUser, setOtherUser] = useState(null);
  const [callStatus, setCallStatus] = useState(isOutgoing ? 'calling' : 'incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(callType === 'video');
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const peerConnection = useRef(null);
  const callTimer = useRef(null);
  const currentCallId = useRef(callId);

  useEffect(() => {
    loadUserInfo();
    initializeCall();

    return () => {
      endCall();
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [socket]);

  const loadUserInfo = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.success) {
        setOtherUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const initializeCall = async () => {
    try {
      // Initialize WebRTC
      const { mediaDevices } = require('react-native-webrtc');
      
      const constraints = {
        audio: true,
        video: callType === 'video' ? {
          width: 1280,
          height: 720,
          frameRate: 30,
        } : false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (isOutgoing) {
        // Create call
        const response = await api.post('/calls', {
          receiver: userId,
          callType,
        });
        
        if (response.success) {
          currentCallId.current = response.data._id;
          socket.emit('call:initiate', {
            callId: response.data._id,
            receiver: userId,
            callType,
          });
        }
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('Error', 'Failed to initialize call');
      navigation.goBack();
    }
  };

  const handleCallAccepted = async (data) => {
    setCallStatus('connected');
    startCallTimer();
    
    // Create peer connection and send offer
    await createPeerConnection();
    await createOffer();
  };

  const handleCallRejected = () => {
    Alert.alert('Call Rejected', 'The user rejected your call');
    navigation.goBack();
  };

  const handleCallEnded = () => {
    navigation.goBack();
  };

  const createPeerConnection = async () => {
    const { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } = require('react-native-webrtc');
    
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', {
          callId: currentCallId.current,
          candidate: event.candidate,
        });
      }
    };
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      socket.emit('webrtc:offer', {
        callId: currentCallId.current,
        offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (data) => {
    try {
      await createPeerConnection();
      
      const { RTCSessionDescription } = require('react-native-webrtc');
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      socket.emit('webrtc:answer', {
        callId: currentCallId.current,
        answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      const { RTCSessionDescription } = require('react-native-webrtc');
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      const { RTCIceCandidate } = require('react-native-webrtc');
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    // Toggle speaker (implementation depends on native module)
    setIsSpeaker(!isSpeaker);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const switchCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track._switchCamera();
      });
    }
  };

  const endCall = async () => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }

      // Notify server
      if (currentCallId.current) {
        socket.emit('call:end', { callId: currentCallId.current });
        await api.post(`/calls/${currentCallId.current}/end`);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error ending call:', error);
      navigation.goBack();
    }
  };

  const getAvatarUrl = () => {
    if (otherUser?.avatar) return otherUser.avatar;
    const displayName = otherUser?.name || otherUser?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=075E54&color=fff&size=400`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return formatDuration(callDuration);
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Remote Video (Full Screen) */}
      {callType === 'video' && remoteStream && !isMinimized ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.avatarContainer}>
          <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
        </View>
      )}

      {/* Local Video (Picture-in-Picture) */}
      {callType === 'video' && localStream && isVideoEnabled && !isMinimized && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
        </View>
      )}

      {/* Minimize Button */}
      {!isMinimized && (
        <TouchableOpacity
          style={styles.minimizeButton}
          onPress={() => setIsMinimized(true)}
        >
          <MaterialCommunityIcons name="window-minimize" size={24} color={Colors.TEXT_WHITE} />
        </TouchableOpacity>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <TouchableOpacity
          style={styles.minimizedContainer}
          onPress={() => setIsMinimized(false)}
        >
          <Image source={{ uri: getAvatarUrl() }} style={styles.minimizedAvatar} />
          <View style={styles.minimizedInfo}>
            <Text style={styles.minimizedName}>
              {otherUser?.name || otherUser?.username}
            </Text>
            <Text style={styles.minimizedStatus}>{getStatusText()}</Text>
          </View>
          <MaterialCommunityIcons name="window-maximize" size={24} color={Colors.TEXT_WHITE} />
        </TouchableOpacity>
      )}

      {/* Call Info */}
      {!isMinimized && (
        <View style={styles.callInfo}>
          <Text style={styles.userName}>
            {otherUser?.name || otherUser?.username}
          </Text>
          <Text style={styles.callStatus}>{getStatusText()}</Text>
        </View>
      )}

      {/* Call Controls */}
      {!isMinimized && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <MaterialCommunityIcons name={isMuted ? 'microphone-off' : 'microphone'}
              size={28}
              color={Colors.TEXT_WHITE}
            />
          </TouchableOpacity>

          {callType === 'video' && (
            <>
              <TouchableOpacity
                style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
                onPress={toggleVideo}
              >
                <MaterialCommunityIcons name={isVideoEnabled ? 'video' : 'video-off'}
                  size={28}
                  color={Colors.TEXT_WHITE}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={switchCamera}
              >
                <MaterialCommunityIcons name="camera-flip" size={28} color={Colors.TEXT_WHITE} />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <MaterialCommunityIcons name={isSpeaker ? 'volume-high' : 'volume-medium'}
              size={28}
              color={Colors.TEXT_WHITE}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={endCall}
          >
            <MaterialCommunityIcons name="phone-hangup" size={28} color={Colors.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_DARK,
  },
  remoteVideo: {
    width,
    height,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.TEXT_WHITE,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  minimizeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
  },
  minimizedContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 12,
  },
  minimizedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  minimizedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  minimizedName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_WHITE,
  },
  minimizedStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  callInfo: {
    position: 'absolute',
    top: height * 0.15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.TEXT_WHITE,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  controlButtonActive: {
    backgroundColor: Colors.ERROR,
  },
  endCallButton: {
    backgroundColor: Colors.ERROR,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});

export default CallScreen;
