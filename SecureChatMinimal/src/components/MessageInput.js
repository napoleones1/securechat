import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '../styles/colors';

const MessageInput = ({ onSend, onTyping, onStopTyping }) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const typingTimeout = useRef(null);
  const recordingAnim = useRef(new Animated.Value(0)).current;

  const handleTextChange = (text) => {
    setMessage(text);

    // Typing indicator
    if (onTyping) onTyping();
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    typingTimeout.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 1000);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), 'text');
      setMessage('');
      if (onStopTyping) onStopTyping();
    }
  };

  const handleImagePick = async () => {
    setShowAttachMenu(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const image = result.assets[0];
        onSend('', 'image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
          size: image.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleVideoPick = async () => {
    setShowAttachMenu(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const video = result.assets[0];
        onSend('', 'video', {
          uri: video.uri,
          type: 'video/mp4',
          name: `video_${Date.now()}.mp4`,
          size: video.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleFilePick = async () => {
    setShowAttachMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        onSend('', 'file', {
          uri: result.uri,
          type: result.mimeType || 'application/octet-stream',
          name: result.name,
          size: result.size || 0,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // TODO: Start actual recording
    Alert.alert('Voice Recording', 'Voice recording feature coming soon!');
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingAnim.stopAnimation();
    
    // TODO: Stop recording and send
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Emoji Button */}
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={message}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
        />

        {/* Attach Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowAttachMenu(true)}>
          <MaterialCommunityIcons name="paperclip" size={24} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>

        {/* Send or Mic Button */}
        {message.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color={Colors.TEXT_WHITE} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.micButton}
            onPressIn={startRecording}
            onPressOut={stopRecording}>
            <MaterialCommunityIcons name="microphone" size={24} color={Colors.TEXT_WHITE} />
          </TouchableOpacity>
        )}
      </View>

      {/* Attach Menu Modal */}
      <Modal
        visible={showAttachMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachMenu(false)}>
          <View style={styles.attachMenu}>
            <TouchableOpacity style={styles.attachItem} onPress={handleImagePick}>
              <View style={[styles.attachIcon, { backgroundColor: '#9C27B0' }]}>
                <MaterialCommunityIcons name="image" size={24} color={Colors.TEXT_WHITE} />
              </View>
              <Text style={styles.attachText}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachItem} onPress={handleVideoPick}>
              <View style={[styles.attachIcon, { backgroundColor: '#F44336' }]}>
                <MaterialCommunityIcons name="video" size={24} color={Colors.TEXT_WHITE} />
              </View>
              <Text style={styles.attachText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachItem}
              onPress={() => {
                setShowAttachMenu(false);
                Alert.alert('Voice Message', 'Press and hold mic button to record');
              }}>
              <View style={[styles.attachIcon, { backgroundColor: '#FF9800' }]}>
                <MaterialCommunityIcons name="microphone" size={24} color={Colors.TEXT_WHITE} />
              </View>
              <Text style={styles.attachText}>Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachItem} onPress={handleFilePick}>
              <View style={[styles.attachIcon, { backgroundColor: '#2196F3' }]}>
                <MaterialCommunityIcons name="file-document" size={24} color={Colors.TEXT_WHITE} />
              </View>
              <Text style={styles.attachText}>File</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Animated.View
            style={[
              styles.recordingDot,
              {
                opacity: recordingAnim,
              },
            ]}
          />
          <Text style={styles.recordingText}>Recording... Slide to cancel</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BG_PRIMARY,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    color: Colors.TEXT_PRIMARY,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.OVERLAY,
    justifyContent: 'flex-end',
  },
  attachMenu: {
    backgroundColor: Colors.BG_PRIMARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachItem: {
    alignItems: 'center',
  },
  attachIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachText: {
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: Colors.ERROR,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.TEXT_WHITE,
    marginRight: 10,
  },
  recordingText: {
    color: Colors.TEXT_WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MessageInput;

