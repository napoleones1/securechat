import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../styles/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username?.replace('@', '') || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameMessage, setUsernameMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username?.replace('@', '') || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    const currentUsername = user?.username?.replace('@', '').toLowerCase();
    const inputUsername = username.trim().toLowerCase();
    
    if (inputUsername && inputUsername !== currentUsername) {
      checkUsernameAvailability(inputUsername);
    } else {
      setUsernameAvailable(true);
      setUsernameMessage('');
    }
  }, [username]);

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameMessage('Username must be at least 3 characters');
      setUsernameAvailable(false);
      return;
    }

    if (!/^[a-z0-9_]+$/i.test(usernameToCheck)) {
      setUsernameMessage('Only letters, numbers, and underscores allowed');
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await api.get(`/auth/check-username?username=${usernameToCheck}`);
      if (response.success) {
        setUsernameAvailable(response.data.available);
        setUsernameMessage(
          response.data.available
            ? '✓ Username available'
            : '✗ Username already taken'
        );
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          setAvatar(response.assets[0]);
        }
      }
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Error', 'Please choose an available username');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('username', `@${username.trim().toLowerCase()}`);
      formData.append('bio', bio.trim());

      if (avatar) {
        formData.append('avatar', {
          uri: avatar.uri,
          type: avatar.type,
          name: avatar.fileName || 'avatar.jpg',
        });
      }

      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        updateUser(response.data);
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatar) {
      return avatar.uri;
    }
    if (user?.avatar) {
      return user.avatar;
    }
    const displayName = user?.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=075E54&color=fff&size=200`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.TEXT_WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.TEXT_WHITE} />
          ) : (
            <Icon name="check" size={24} color={Colors.TEXT_WHITE} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
            <View style={styles.avatarOverlay}>
              <Icon name="camera" size={32} color={Colors.TEXT_WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.TEXT_TERTIARY}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.usernameContainer}>
              <Text style={styles.usernamePrefix}>@</Text>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={(text) => setUsername(text.replace(/[^a-z0-9_]/gi, ''))}
                placeholder="username"
                placeholderTextColor={Colors.TEXT_TERTIARY}
                autoCapitalize="none"
              />
              {checkingUsername && (
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
              )}
            </View>
            {usernameMessage ? (
              <Text
                style={[
                  styles.usernameMessage,
                  { color: usernameAvailable ? Colors.ACCENT : Colors.ERROR },
                ]}
              >
                {usernameMessage}
              </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={Colors.TEXT_TERTIARY}
              multiline
              numberOfLines={3}
            />
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
  avatarContainer: {
    position: 'relative',
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
  avatarHint: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  usernamePrefix: {
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    padding: 0,
  },
  usernameMessage: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default ProfileScreen;
