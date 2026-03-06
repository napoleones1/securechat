# 📱 Cara Preview App SecureChat (PALING MUDAH)

## ✅ Metode 1: Expo Go (RECOMMENDED - 100% BERHASIL)

### Langkah-langkah:

#### 1. Install Expo Go di HP Android
- Buka Google Play Store
- Cari "Expo Go"
- Install aplikasi Expo Go

#### 2. Jalankan Preview di Laptop
Buka terminal di folder `SecureChatExpo`:

```bash
cd SecureChatExpo
npx expo start
```

#### 3. Scan QR Code
- Tunggu sampai muncul QR code di terminal
- Buka Expo Go di HP
- Tap "Scan QR Code"
- Scan QR code dari terminal laptop
- App akan langsung jalan di HP!

### Keuntungan Metode Ini:
- ✅ 100% berhasil (tidak ada error)
- ✅ Tidak perlu build APK dulu
- ✅ Bisa test semua fitur
- ✅ Hot reload (perubahan langsung terlihat)
- ✅ Tidak perlu Android Studio
- ✅ Tidak perlu setup SDK

---

## 🔧 Metode 2: Android Emulator (Jika Punya Android Studio)

```bash
cd SecureChatExpo
npx expo start --android
```

Pastikan emulator sudah jalan di Android Studio.

---

## 📝 Troubleshooting

### Error: "expo command not found"
```bash
npm install -g expo-cli
```

### Error: "Cannot find module"
```bash
cd SecureChatExpo
npm install
```

### QR Code tidak muncul?
Tekan `w` untuk buka di browser, atau `a` untuk Android emulator.

---

## 🎯 Setelah Preview OK

Jika app sudah jalan dengan baik di Expo Go, baru kita build APK dengan:

```bash
eas build --platform android --profile preview
```

---

## ⚡ Quick Start

**Paling cepat:**
1. Install "Expo Go" di HP (dari Play Store)
2. Buka terminal: `cd SecureChatExpo`
3. Run: `npx expo start`
4. Scan QR code dengan Expo Go
5. Done! App jalan di HP

**Tidak perlu build APK untuk preview!**
