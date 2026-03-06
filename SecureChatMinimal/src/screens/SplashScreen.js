import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../styles/colors';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      setTimeout(() => {
        if (token && userData) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>SC</Text>
        </View>
        <Text style={styles.appName}>SecureChat</Text>
        <Text style={styles.tagline}>Secure messaging & calls</Text>
      </View>
      <ActivityIndicator size="large" color={Colors.ACCENT} style={styles.loader} />
      <Text style={styles.version}>v0.1.0-alpha</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.TEXT_WHITE,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.TEXT_WHITE,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.TEXT_LIGHT,
  },
  loader: {
    marginTop: 20,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: Colors.TEXT_LIGHT,
  },
});

export default SplashScreen;
