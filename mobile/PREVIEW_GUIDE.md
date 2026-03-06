# 📱 Panduan Preview Mobile App - Step by Step

## 🎯 Tujuan
Melihat dan testing aplikasi mobile SecureChat sebelum build APK.

---

## ⚡ Cara Tercepat (5 Menit)

### Step 1: Buka Android Studio
1. Buka Android Studio
2. Klik "More Actions" → "Virtual Device Manager"
3. Klik tombol ▶️ (Play) pada device yang ada
4. Tunggu emulator menyala (2-3 menit)

**Belum punya emulator?** Klik "Create Device" → Pilih "Pixel 5" → Download System Image → Finish

### Step 2: Check Backend
```bash
cd backend
npm start
```

Buka browser: `http://localhost:5000/api/health`  
Harus muncul: `{"status":"ok"}`

### Step 3: Configure API URL
Buka file: `mobile/src/config/api.js`

Untuk **Emulator**, pastikan seperti ini:
```javascript
export const API_URL = 'http://10.0.2.2:5000/api';
export const SOCKET_URL = 'http://10.0.2.2:5000';
```

### Step 4: Run App
```bash
cd mobile
npm run android
```

**Tunggu 2-5 menit** untuk build pertama kali.

### ✅ Selesai!
App akan otomatis terbuka di emulator dan siap ditest!

---

## 📋 Checklist Sebelum Run

Jalankan script checker:
```bash
cd mobile
check-setup.bat
```

Atau check manual:

- [ ] Node.js installed? → `node --version`
- [ ] Android SDK installed? → `adb version`
- [ ] Emulator/Device running? → `adb devices`
- [ ] Backend running? → `http://localhost:5000/api/health`
- [ ] Dependencies installed? → folder `node_modules` ada?
- [ ] API URL configured? → check `src/config/api.js`

---

## 🖥️ Pilihan Device untuk Preview

### Opsi A: Android Emulator (RECOMMENDED)
**Kelebihan:**
- ✅ Tidak perlu HP fisik
- ✅ Mudah di-setup
- ✅ Bisa test dengan cepat
- ✅ Bisa buka multiple emulator untuk test calls

**Kekurangan:**
- ❌ Butuh RAM besar (min 8GB)
- ❌ Agak lambat di komputer low-end

**Setup:**
1. Install Android Studio
2. Buat Virtual Device (Pixel 5 recommended)
3. Start emulator
4. Run `npm run android`

---

### Opsi B: Physical Android Device
**Kelebihan:**
- ✅ Lebih smooth & cepat
- ✅ Test dengan device asli
- ✅ Bisa test sensor (camera, mic, dll)

**Kekurangan:**
- ❌ Butuh HP Android
- ❌ Butuh kabel USB
- ❌ Butuh enable Developer Mode

**Setup:**
1. Enable Developer Options di HP
2. Enable USB Debugging
3. Connect via USB
4. Check: `adb devices`
5. Configure IP address di `api.js`
6. Run `npm run android`

---

### Opsi C: Expo Go (Tidak Direkomendasikan)
**Note:** App ini dibuat dengan React Native CLI, bukan Expo.  
Untuk pakai Expo Go, perlu setup ulang project dari awal.

---

## 🔧 Setup Detail

### A. Install Android Studio

1. **Download:**
   - https://developer.android.com/studio
   - Pilih versi untuk Windows

2. **Install:**
   - Run installer
   - Pilih "Standard" installation
   - Tunggu download SDK (5-10 GB)

3. **Setup Environment Variables:**
   ```
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   
   Path tambahkan:
   - %ANDROID_HOME%\platform-tools
   - %ANDROID_HOME%\emulator
   - %ANDROID_HOME%\tools
   ```

4. **Verify:**
   ```bash
   adb version
   ```

### B. Create Virtual Device

1. Buka Android Studio
2. Klik "More Actions" → "Virtual Device Manager"
3. Klik "Create Device"
4. Pilih "Phone" → "Pixel 5"
5. Klik "Next"
6. Download System Image: "R" (API Level 30)
7. Klik "Next" → "Finish"

### C. Start Emulator

**Via Android Studio:**
1. Virtual Device Manager
2. Klik ▶️ pada device
3. Tunggu boot (2-3 menit)

**Via Command Line:**
```bash
emulator -avd Pixel_5_API_30
```

### D. Configure API URL

**File:** `mobile/src/config/api.js`

**Untuk Emulator:**
```javascript
export const API_URL = 'http://10.0.2.2:5000/api';
export const SOCKET_URL = 'http://10.0.2.2:5000';
```

**Untuk Physical Device:**
```javascript
// Ganti dengan IP komputer Anda
export const API_URL = 'http://192.168.1.100:5000/api';
export const SOCKET_URL = 'http://192.168.1.100:5000';
```

**Cara cek IP komputer:**
```bash
# Windows
ipconfig
# Cari "IPv4 Address"

# Contoh: 192.168.1.100
```

---

## 🚀 Running the App

### Method 1: Using Script (Easiest)
```bash
cd mobile
run-preview.bat
```

### Method 2: Manual Steps

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npm install  # first time only
npm run android
```

### Method 3: Step by Step

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```
   
2. **Check Backend:**
   - Buka browser: `http://localhost:5000/api/health`
   - Harus muncul: `{"status":"ok"}`

3. **Start Emulator:**
   - Buka Android Studio
   - Virtual Device Manager
   - Klik ▶️ Play button

4. **Check Device:**
   ```bash
   adb devices
   ```
   Harus muncul device ID

5. **Install Dependencies:**
   ```bash
   cd mobile
   npm install
   ```

6. **Run App:**
   ```bash
   npm run android
   ```

7. **Wait for Build:**
   - First build: 2-5 menit
   - Next builds: 30-60 detik

8. **App Opens:**
   - Emulator akan show app
   - Splash screen → Login screen

---

## 🧪 Testing Flow

### 1. First Time Setup (5 menit)
1. ✅ App opens → Splash screen
2. ✅ Login screen appears
3. ✅ Tap "Register"
4. ✅ Fill form:
   - Name: Test User
   - Username: testuser
   - Email: test@test.com
   - Password: Test123456
5. ✅ Tap "Register"
6. ✅ Should redirect to main screen

### 2. Test Messaging (5 menit)
1. ✅ Tap "+" button (bottom right)
2. ✅ Search for user
3. ✅ Tap user to create chat
4. ✅ Type message → Send
5. ✅ Tap attach button
6. ✅ Try send image
7. ✅ Try send video
8. ✅ Press & hold mic for voice
9. ✅ Check message status (✓, ✓✓)

### 3. Test Groups (3 menit)
1. ✅ Tap "+" → "New Group"
2. ✅ Enter group name
3. ✅ Select members
4. ✅ Create group
5. ✅ Send message in group
6. ✅ Tap group name → Group info
7. ✅ Try edit (if admin)

### 4. Test Profile (2 menit)
1. ✅ Go to Settings tab
2. ✅ Tap profile section
3. ✅ Edit name
4. ✅ Edit username
5. ✅ Edit bio
6. ✅ Change avatar
7. ✅ Save

### 5. Test Calls (Butuh 2 Device)
1. ✅ Open chat
2. ✅ Tap phone icon (voice call)
3. ✅ Accept on other device
4. ✅ Test mute/unmute
5. ✅ End call
6. ✅ Try video call
7. ✅ Test camera switch
8. ✅ Test minimize/maximize

---

## 🐛 Common Issues & Solutions

### Issue 1: "Metro Bundler failed to start"
**Solution:**
```bash
cd mobile
npm start -- --reset-cache
```

### Issue 2: "Build failed"
**Solution:**
```bash
cd mobile/android
./gradlew clean
cd ..
npm run android
```

### Issue 3: "Cannot connect to backend"
**Checklist:**
- [ ] Backend running? → `http://localhost:5000/api/health`
- [ ] API URL correct? → Check `src/config/api.js`
- [ ] Using emulator? → Must use `10.0.2.2`
- [ ] Using physical device? → Must use computer's IP
- [ ] Same WiFi? → Device & computer must be on same network
- [ ] Firewall? → Allow port 5000

**Solution:**
```bash
# Check backend
curl http://localhost:5000/api/health

# For emulator, use:
http://10.0.2.2:5000/api

# For physical device, use:
http://YOUR_COMPUTER_IP:5000/api
```

### Issue 4: "No devices found"
**Solution:**
```bash
# Check devices
adb devices

# If empty, start emulator or connect phone

# Restart adb
adb kill-server
adb start-server
adb devices
```

### Issue 5: "App crashes on startup"
**Solution:**
```bash
# Clear cache
cd mobile
npm start -- --reset-cache

# Uninstall old app
adb uninstall com.securechat

# Rebuild
npm run android
```

### Issue 6: "Port 8081 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Then restart
npm start
```

---

## 📸 Taking Screenshots

### During Testing:
```bash
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/

# Record video
adb shell screenrecord /sdcard/demo.mp4
# Press Ctrl+C to stop
adb pull /sdcard/demo.mp4 ./videos/
```

---

## 💡 Pro Tips

1. **Use Emulator First**
   - Lebih mudah untuk testing awal
   - Tidak perlu setup IP address

2. **Keep Metro Running**
   - Jangan close terminal Metro
   - Untuk reload: Press R twice

3. **Enable Hot Reload**
   - Shake device → Enable Hot Reloading
   - Code changes auto-refresh

4. **Use Dev Menu**
   - Shake device atau Ctrl+M
   - Access: Debug, Reload, etc.

5. **Check Logs**
   ```bash
   # View logs
   npx react-native log-android
   
   # Or in Metro terminal
   ```

6. **Test with 2 Accounts**
   - Register 2 accounts
   - Test messaging between them
   - Test calls (need 2 devices)

---

## ✅ Success Indicators

Jika berhasil, Anda akan melihat:

1. **Splash Screen** (2 detik)
   - Logo SecureChat
   - Loading indicator

2. **Login Screen**
   - Email/Username input
   - Password input
   - Login & Register buttons

3. **Main Screen** (after login)
   - 3 tabs: Chats, Calls, Settings
   - Chat list (empty jika baru)
   - FAB button (+) untuk new chat

4. **All Features Working**
   - ✅ Can send messages
   - ✅ Can upload images
   - ✅ Can create groups
   - ✅ Can edit profile
   - ✅ Can make calls (with 2 devices)

---

## 🎯 Next Steps

Setelah preview & testing:

1. **Fix Bugs** (jika ada)
2. **Test All Features**
3. **Build APK** untuk production
4. **Deploy** ke Play Store (optional)

---

## 📞 Need Help?

Jika stuck, check:
1. `mobile/QUICK_START_PREVIEW.md` - Quick start guide
2. `mobile/HOW_TO_RUN.md` - Detailed setup
3. `mobile/COMPLETION_SUMMARY.md` - Feature list
4. Logs di Metro terminal
5. Logs: `npx react-native log-android`

---

**Ready to preview? Let's go! 🚀**

```bash
# Quick start:
cd mobile
run-preview.bat
```
