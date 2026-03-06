# 🚀 Build APK - Quick Guide

## ⚡ Cara Tercepat Build APK (5 Menit)

### Step 1: Configure Backend URL

Edit `mobile/src/config/api.js`:

```javascript
// Ganti dengan IP komputer Anda
export const API_URL = 'http://192.168.1.100:5000/api';
export const SOCKET_URL = 'http://192.168.1.100:5000';
```

**Cara cek IP:**
```bash
ipconfig
# Cari IPv4 Address
```

### Step 2: Run Build Script

```bash
cd mobile
build-apk.bat
```

### Step 3: Wait

- First build: 5-10 menit
- Next builds: 2-3 menit

### Step 4: Get APK

APK akan tersimpan di:
```
mobile/SecureChat-debug.apk
```

### Step 5: Install

**Via USB:**
```bash
adb install SecureChat-debug.apk
```

**Via Transfer:**
1. Copy APK ke HP
2. Buka file manager
3. Tap APK
4. Install

---

## 🎯 That's It!

APK siap diinstall dan ditest di HP Android!

---

## 📝 Notes

- Ini adalah **Debug APK** (untuk testing)
- Size: ~50-80 MB
- Tidak di-optimize
- Bisa langsung diinstall

Untuk **Release APK** (production):
- Lihat `BUILD_APK.md`
- Perlu signing key
- Size lebih kecil (~30-50 MB)
- Optimized dengan ProGuard

---

## 🐛 Troubleshooting

### Build Failed?

1. **Check Java:**
   ```bash
   java -version
   # Harus 11 atau lebih tinggi
   ```

2. **Check Android SDK:**
   ```bash
   # Set environment variable
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

3. **Clean & Rebuild:**
   ```bash
   cd mobile/android
   gradlew clean
   gradlew assembleDebug
   ```

4. **Out of Memory:**
   Edit `android/gradle.properties`:
   ```
   org.gradle.jvmargs=-Xmx4096m
   ```

---

## ✅ Success Indicators

Jika berhasil, Anda akan lihat:

```
BUILD SUCCESSFUL in 5m 23s
```

Dan file APK akan ada di:
```
mobile/SecureChat-debug.apk
```

---

**Ready? Run:**

```bash
cd mobile
build-apk.bat
```

**Happy building! 🚀**
