import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Colors from '../styles/colors';

const Avatar = ({ uri, name, size = 50, online = false, style }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarUrl = uri || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=007AFF&color=fff&size=128`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
      {online && (
        <View style={[styles.onlineBadge, { width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125 }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: Colors.BG_SECONDARY,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.ONLINE,
    borderWidth: 2,
    borderColor: Colors.BG_PRIMARY,
  },
});

export default Avatar;
