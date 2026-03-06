import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../styles/colors';
import api from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const checkUsername = async (value) => {
    const cleanUsername = value.replace(/^@+/, '');
    setUsername(cleanUsername);

    if (cleanUsername.length < 2) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await api.get(`/auth/check-username/@${cleanUsername}`);
      setUsernameAvailable(response.available);
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  const handleRegister = async () => {
    if (!email || !name || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Error', 'Username is not available');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email,
        name,
        username: `@${username}`,
        password,
      });

      if (response.success) {
        Alert.alert('Success', 'Registration successful! Please login.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SC</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="account" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="at" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
            <Text style={styles.usernamePrefix}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={username}
              onChangeText={checkUsername}
              autoCapitalize="none"
            />
            {usernameAvailable !== null && (
              <Icon
                name={usernameAvailable ? 'check-circle' : 'close-circle'}
                size={20}
                color={usernameAvailable ? Colors.SUCCESS : Colors.ERROR}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={Colors.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.TEXT_WHITE} />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.TEXT_WHITE,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  usernamePrefix: {
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
  },
  registerButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
});

export default RegisterScreen;
