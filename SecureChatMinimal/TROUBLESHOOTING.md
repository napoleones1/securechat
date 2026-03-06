# 🔧 Troubleshooting Build Errors

## 🔍 Root Cause Analysis

Setelah analisa, build error disebabkan oleh:

### 1. react-native-vector-icons ❌
- **Masalah:** Tidak compatible dengan Expo managed workflow
- **Solusi:** Ganti dengan `@expo/vector-icons`
- **Files affected:** 14 files

### 2. react-native-image-picker ❌  
- **Masalah:** Tidak compatible dengan Expo managed workflow
- **Solusi:** Ganti dengan `expo-image-picker` (sudah ada)
- **Files affected:** 3 files (ProfileScreen, NewGroupScreen, MessageInput)

### 3. react-native-document-picker ❌
- **Masalah:** Package name salah
- **Solusi:** Sudah pakai `expo-document-picker` yang benar
- **Files affected:** 1 file (MessageInput)

### 4. react-native-webrtc ❌
- **Masalah:** Tidak compatible dengan Expo managed workflow
- **Solusi:** Hapus fitur calls (sudah dilakukan)
- **Files affected:** CallScreen, IncomingCallScreen (sudah dihapus dari App.js)

## ✅ Solusi Lengkap

### Opsi A: Fix Manual (2-3 jam)
Replace semua import di 14 files:
```javascript
// OLD
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// NEW  
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Ganti <Icon> jadi <MaterialCommunityIcons>
```

Replace image picker di 3 files:
```javascript
// OLD
import { launchImageLibrary } from 'react-native-image-picker';

// NEW
import * as ImagePicker from 'expo-image-picker';
```

Replace document picker di 1 file:
```javascript
// OLD
import DocumentPicker from 'react-native-document-picker';

// NEW
import * as DocumentPicker from 'expo-document-picker';
```

### Opsi B: Build Minimal + Add Features Later (30 menit)
1. Pakai APK minimal yang sudah jadi
2. Add fitur via OTA update nanti
3. Atau buat web version untuk fitur lengkap

### Opsi C: Use Expo Bare Workflow (3-4 jam)
1. Eject dari managed workflow
2. Install native dependencies
3. Build dengan Android Studio
4. Lebih kompleks tapi full control

## 📝 Rekomendasi

**Untuk sekarang:**
Saya sarankan **Opsi B** - pakai APK minimal dulu karena:
- APK sudah jadi dan jalan
- Anda punya proof of concept
- Bisa add fitur nanti via update

**Untuk production:**
Saya sarankan **Opsi A** - fix manual karena:
- Sekali fix, permanent solution
- Semua fitur bisa jalan
- Native experience

## 🚀 Next Steps

Kalau mau saya lanjutkan fix manual (Opsi A):
1. Saya akan replace semua imports (15-20 menit)
2. Build APK baru (15-20 menit)
3. Test di HP (5 menit)
4. Total: ~45 menit

Atau kalau mau pakai APK minimal dulu (Opsi B):
1. Download APK yang sudah jadi
2. Install di HP
3. Done!

Mana yang Anda pilih?
