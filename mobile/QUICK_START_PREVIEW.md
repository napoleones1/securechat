# 🚀 Quick Start - Preview Mobile App

## Cara Tercepat untuk Melihat Preview

### Opsi 1: Android Emulator (RECOMMENDED)

#### Step 1: Install Android Studio
1. Download dari: https://developer.android.com/studio
2. Install Android Studio
3. Buka Android Studio
4. Klik "More Actions" → "Virtual Device Manager"
5. Klik "Create Device"
6. Pilih "Pixel 5" atau device lain
7. Pilih System Image: "R" (API Level 30)
8. Klik "Finish"

#### Step 2: Start Emulator
1. Di Virtual Device Manager, klik tombol ▶️ (Play) pada device yang dibuat
2. Tunggu emulator menyala (2-3 menit pertama kali)

#### Step 3: Install Dependencies
```bash
cd mobile
npm install
```

#### Step 4: Configure Backend URL
Edit `mobile/src/config/api.js`:
```javascript
// Untuk Android Emulator, gunakan IP khusus:
export const API_URL = 'http://10.0.2.2:5000/api';
export const SOCKET_URL = 'http://10.0.2.2:5000';
```

**PENTING:** `10.0.2.2` adalah IP khusus untuk mengakses localhost dari Android Emulator!

#### Step 5: Start Backend Server
```bash
# Terminal 1 - Backend
cd backend
npm start
```

Pastikan backend running di `http://localhost:5000`

#### Step 6: Run Mobile App
```bash
# Terminal 2 - Mobile App
cd mobile
npm run android
```

**Tunggu 2-5 menit** untuk build pertama kali.

#### ✅ Hasil:
- Emulator akan otomatis terbuka
- App akan ter-install otomatis
- App akan langsung running
- Anda bisa langsung test semua fitur!

---

### Opsi 2: Physical Android Device

#### Step 1: Enable Developer Mode
1. Buka Settings → About Phone
2. Tap "Build Number" 7 kali
3. Kembali → Developer Options
4. Enable "USB Debugging"

#### Step 2: Connect Device
1. Hubungkan HP ke komputer via USB
2. Pilih "File Transfer" atau "MTP" di HP
3. Allow USB Debugging di HP

#### Step 3: Check Connection
```bash
adb devices
```

Harus muncul device ID Anda.

#### Step 4: Find Your Computer's IP
```bash
# Windows
ipconfig
# Cari "IPv4 Address", contoh: 192.168.1.100

# Mac/Linux
ifconfig
# Cari "inet", contoh: 192.168.1.100
```

#### Step 5: Configure Backend URL
Edit `mobile/src/config/api.js`:
```javascript
// Ganti dengan IP komputer Anda
export const API_URL = 'http://192.168.1.100:5000/api';
export const SOCKET_URL = 'http://192.168.1.100:5000';
```

**PENTING:** HP dan komputer harus di WiFi yang sama!

#### Step 6: Start Backend
```bash
cd backend
npm start
```

#### Step 7: Run App
```bash
cd mobile
npm run android
```

#### ✅ Hasil:
- App akan ter-install di HP Anda
- Bisa test dengan device fisik
- Lebih smooth dari emulator

---

### Opsi 3: Expo Go (Alternatif - Butuh Setup Ulang)

**Note:** Aplikasi ini dibuat dengan React Native CLI, bukan Expo. Untuk menggunakan Expo Go, perlu setup ulang project.

---

## 🧪 Testing Checklist

Setelah app running, test fitur-fitur ini:

### 1. Authentication
- [ ] Register account baru
- [ ] Login dengan email
- [ ] Logout
- [ ] Login lagi (test auto-login)

### 2. Messaging
- [ ] Buat chat baru
- [ ] Kirim text message
- [ ] Kirim image (tap attach → image)
- [ ] Kirim video (tap attach → video)
- [ ] Kirim voice (press & hold mic button)
- [ ] Kirim file (tap attach → file)
- [ ] Lihat message status (✓, ✓✓, ✓✓)
- [ ] Lihat typing indicator

### 3. Groups
- [ ] Buat group baru
- [ ] Tambah members
- [ ] Kirim message di group
- [ ] Edit group info (jika admin)
- [ ] Lihat member list

### 4. Profile
- [ ] Edit profile
- [ ] Ganti avatar
- [ ] Ganti username
- [ ] Ganti bio
- [ ] Lihat profile user lain

### 5. Calls (Butuh 2 Device)
- [ ] Voice call
- [ ] Video call
- [ ] Accept/reject call
- [ ] Mute/unmute
- [ ] Toggle video
- [ ] Minimize/maximize
- [ ] End call

---

## 🐛 Troubleshooting

### "Metro Bundler failed to start"
```bash
cd mobile
npm start -- --reset-cache
```

### "Build failed"
```bash
cd mobile/android
./gradlew clean
cd ..
npm run android
```

### "Cannot connect to backend"
1. Cek backend running: buka browser → `http://localhost:5000/api/health`
2. Cek IP address benar
3. Cek firewall tidak block port 5000
4. Untuk emulator, pastikan pakai `10.0.2.2`
5. Untuk physical device, pastikan di WiFi yang sama

### "App crashes on startup"
```bash
# Clear cache
cd mobile
npm start -- --reset-cache

# Rebuild
npm run android
```

### "Metro port already in use"
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

---

## 📱 Screenshot & Recording

### Take Screenshot
```bash
# Android
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### Record Screen
```bash
# Android
adb shell screenrecord /sdcard/demo.mp4
# Press Ctrl+C to stop
adb pull /sdcard/demo.mp4
```

---

## ⚡ Quick Commands

```bash
# Start everything
cd backend && npm start &
cd mobile && npm run android

# Reload app
# Press R twice in Metro terminal
# Or shake device → Reload

# Open dev menu
# Press Ctrl+M (Android)
# Or shake device

# View logs
npx react-native log-android
```

---

## 🎯 Expected Result

Setelah berhasil running, Anda akan melihat:

1. **Splash Screen** (2 detik)
2. **Login Screen** (jika belum login)
3. **Main Screen** dengan 3 tabs:
   - Chats (list chat)
   - Calls (call history)
   - Settings (profile & logout)

Semua fitur sudah bisa ditest langsung!

---

## 💡 Tips

1. **Gunakan Emulator** untuk testing pertama (lebih mudah)
2. **Gunakan Physical Device** untuk test performa & calls
3. **Buat 2 account** untuk test messaging & calls
4. **Gunakan 2 device/emulator** untuk test calls
5. **Check logs** jika ada error

---

## 🆘 Need Help?

Jika ada error, check:
1. Backend running? → `http://localhost:5000/api/health`
2. Metro running? → Terminal harus ada "Metro Bundler"
3. Device connected? → `adb devices`
4. IP address benar? → Check `src/config/api.js`
5. Firewall? → Allow port 5000 & 8081

---

**Ready to preview? Let's go! 🚀**

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd mobile
npm run android
```
