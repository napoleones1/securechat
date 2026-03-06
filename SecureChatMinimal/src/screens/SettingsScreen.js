import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../styles/colors';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, onPress, color = Colors.TEXT_PRIMARY }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.settingText, { color }]}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.TEXT_TERTIARY} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => navigation.navigate('Profile')}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileUsername}>{user?.username || '@username'}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.TEXT_TERTIARY} />
      </TouchableOpacity>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="account"
          title="Profile"
          onPress={() => navigation.navigate('Profile')}
        />
        <SettingItem
          icon="lock"
          title="Privacy"
          onPress={() => Alert.alert('Coming Soon', 'Privacy settings')}
        />
        <SettingItem
          icon="bell"
          title="Notifications"
          onPress={() => Alert.alert('Coming Soon', 'Notification settings')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <SettingItem
          icon="help-circle"
          title="Help"
          onPress={() => Alert.alert('Help', 'Need help? Contact support')}
        />
        <SettingItem
          icon="information"
          title="About"
          onPress={() => Alert.alert('SecureChat', 'Version 0.1.0-alpha')}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon="logout"
          title="Logout"
          onPress={handleLogout}
          color={Colors.ERROR}
        />
      </View>

      <Text style={styles.version}>Version 0.1.0-alpha</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.BG_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.TEXT_WHITE,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 3,
  },
  profileUsername: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  section: {
    marginTop: 20,
    backgroundColor: Colors.BG_PRIMARY,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.BORDER,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.BG_SECONDARY,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.TEXT_TERTIARY,
    marginVertical: 20,
  },
});

export default SettingsScreen;
