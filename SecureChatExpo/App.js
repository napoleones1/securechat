import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ SecureChat</Text>
      <Text style={styles.subtitle}>Preview Berhasil!</Text>
      <Text style={styles.version}>Version 0.1.0</Text>
      <Text style={styles.note}>
        App berjalan dengan baik.{'\n'}
        Siap untuk build APK!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
  },
  note: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
