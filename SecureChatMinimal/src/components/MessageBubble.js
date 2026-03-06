import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Colors from '../styles/colors';

const MessageBubble = ({ message, isSent, currentUser }) => {
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return <Text style={styles.messageText}>{message.content}</Text>;
      
      case 'image':
        return (
          <TouchableOpacity>
            <Image
              source={{ uri: message.fileUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.content && (
              <Text style={styles.messageText}>{message.content}</Text>
            )}
          </TouchableOpacity>
        );
      
      case 'video':
        return (
          <TouchableOpacity style={styles.videoContainer}>
            <Image
              source={{ uri: message.fileUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            <View style={styles.playButton}>
              <MaterialCommunityIcons name="play-circle" size={48} color={Colors.TEXT_WHITE} />
            </View>
            {message.content && (
              <Text style={styles.messageText}>{message.content}</Text>
            )}
          </TouchableOpacity>
        );
      
      case 'voice':
        return (
          <View style={styles.voiceContainer}>
            <TouchableOpacity style={styles.playButton}>
              <MaterialCommunityIcons name="play" size={24} color={isSent ? Colors.TEXT_PRIMARY : Colors.TEXT_WHITE} />
            </TouchableOpacity>
            <View style={styles.waveform}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { height: Math.random() * 20 + 10 },
                    { backgroundColor: isSent ? Colors.TEXT_PRIMARY : Colors.TEXT_WHITE }
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.duration, { color: isSent ? Colors.TEXT_SECONDARY : Colors.TEXT_WHITE }]}>
              0:45
            </Text>
          </View>
        );
      
      case 'file':
        return (
          <TouchableOpacity style={styles.fileContainer}>
            <View style={styles.fileIcon}>
              <MaterialCommunityIcons name="file-document" size={32} color={Colors.PRIMARY} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {message.fileName || 'Document'}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(message.fileSize)}
              </Text>
            </View>
            <MaterialCommunityIcons name="download" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        );
      
      default:
        return <Text style={styles.messageText}>{message.content}</Text>;
    }
  };

  const renderMessageStatus = () => {
    if (!isSent) return null;

    let icon = 'check';
    let color = Colors.STATUS_SENT;

    if (message.status === 'delivered') {
      icon = 'check-all';
      color = Colors.STATUS_DELIVERED;
    } else if (message.status === 'read') {
      icon = 'check-all';
      color = Colors.STATUS_READ;
    }

    return (
      <MaterialCommunityIcons name={icon}
        size={16}
        color={color}
        style={styles.statusIcon}
      />
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const messageTime = message.createdAt
    ? format(new Date(message.createdAt), 'HH:mm')
    : '';

  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      {!isSent && message.sender && (
        <Text style={styles.senderName}>{message.sender.name}</Text>
      )}
      
      <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        {renderMessageContent()}
        
        <View style={styles.footer}>
          <Text style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}>
            {messageTime}
          </Text>
          {renderMessageStatus()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 10,
  },
  bubble: {
    borderRadius: 8,
    padding: 8,
    elevation: 1,
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sentBubble: {
    backgroundColor: Colors.BUBBLE_SENT,
    borderBottomRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: Colors.BUBBLE_RECEIVED,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  videoContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 1,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 30,
    marginHorizontal: 10,
  },
  waveformBar: {
    width: 3,
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 8,
    padding: 10,
    minWidth: 200,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BG_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    marginRight: 4,
  },
  sentTime: {
    color: Colors.TEXT_SECONDARY,
  },
  receivedTime: {
    color: Colors.TEXT_TERTIARY,
  },
  statusIcon: {
    marginLeft: 2,
  },
});

export default MessageBubble;
