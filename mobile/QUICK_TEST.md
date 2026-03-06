# 🚀 Quick Test - Mobile App

## Cara Tercepat untuk Test Mobile App

### Opsi 1: Expo Go (RECOMMENDED - 5 menit) ⚡

#### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

#### Step 2: Convert to Expo (Sudah Disiapkan)
Project sudah dikonfigurasi untuk Expo. Tinggal install dependencies:

```bash
cd mobile
npm install expo
npx expo install react-native-web react-dom @expo/webpack-config
```

#### Step 3: Start Expo
```bash
npx expo start
```

#### Step 4: Test di HP
1. Install **Expo Go** app di HP Anda:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. Scan QR code yang muncul di terminal
3. App akan langsung jalan di HP Anda!

**Catatan:** Backend harus running dan API_URL harus diubah ke IP komputer Anda.

---

### Opsi 2: Android Emulator (30 menit)

#### Prerequisites:
1. Install Android Studio
2. Setup Android SDK
3. Create Virtual Device (AVD)

#### Steps:
```bash
# 1. Start emulator dari Android Studio
# Tools → AVD Manager → Play button

# 2. Install dependencies
cd mobile
npm install

# 3. Run app
npm run android
```

---

### Opsi 3: Web Preview (TERCEPAT untuk Demo) 🌐

Saya bisa membuat web version yang mirip mobile app untuk demo cepat!

---

## 🎯 Rekomendasi Saya:

### Untuk Test Cepat Sekarang:
**Gunakan Opsi 3 - Web Preview**

Saya akan membuat standalone HTML file yang meniru tampilan mobile app, bisa langsung dibuka di browser!

### Untuk Test di HP Asli:
**Gunakan Opsi 1 - Expo Go**

Paling mudah, tidak perlu setup Android Studio/Xcode.

---

## Mau yang mana?

1. **Web Preview** - Saya buatkan HTML file yang bisa langsung dibuka di browser (5 detik)
2. **Expo Setup** - Saya guide step-by-step untuk test di HP (5 menit)
3. **Full Native** - Setup Android Studio untuk emulator (30 menit)

Pilih yang mana? 😊
