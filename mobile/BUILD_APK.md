# 📦 Build APK - SecureChat Mobile

## 🎯 Panduan Lengkap Build APK

### Prerequisites
- ✅ Android Studio installed
- ✅ Android SDK installed
- ✅ Java JDK installed
- ✅ Node.js installed

---

## ⚡ Quick Build (Debug APK)

### Method 1: Using Script (EASIEST)

```bash
cd mobile
build-apk.bat
```

APK akan tersimpan di: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

### Method 2: Manual Steps

#### Step 1: Configure Backend URL

**PENTING:** Sebelum build, set backend URL yang akan digunakan!

Edit `mobile/src/config/api.js`:

```javascript
// Untuk testing lokal
export const API_URL = 'http://YOUR_IP:5000/api';
export const SOCKET_URL = 'http://YOUR_IP:5000';

// Untuk production (jika sudah deploy backend)
export const API_URL = 'https://your-backend.com/api';
export const SOCKET_URL = 'https://your-backend.com';
```

**Cara cek IP komputer:**
```bash
ipconfig
# Cari IPv4 Address, contoh: 192.168.1.100
```

#### Step 2: Clean Build

```bash
cd mobile/android
./gradlew clean
cd ..
```

#### Step 3: Build Debug APK

```bash
cd mobile/android
./gradlew assembleDebug
cd ..
```

**Tunggu 5-10 menit** untuk build pertama kali.

#### Step 4: Find APK

APK location:
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Copy ke folder yang mudah diakses:
```bash
copy android\app\build\outputs\apk\debug\app-debug.apk SecureChat-debug.apk
```

---

## 🔐 Build Release APK (Production)

### Step 1: Generate Signing Key

```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore securechat-release-key.keystore -alias securechat-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Isi informasi:**
- Password: (buat password, ingat baik-baik!)
- First and last name: SecureChat
- Organizational unit: Development
- Organization: SecureChat
- City: Your City
- State: Your State
- Country code: ID

**SIMPAN FILE INI:** `securechat-release-key.keystore`

### Step 2: Configure Gradle

Create file: `mobile/android/gradle.properties`

Add:
```properties
MYAPP_RELEASE_STORE_FILE=securechat-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=securechat-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_password_here
MYAPP_RELEASE_KEY_PASSWORD=your_password_here
```

**JANGAN COMMIT FILE INI KE GIT!**

### Step 3: Update build.gradle

Edit `mobile/android/app/build.gradle`:

Find `android { ... }` section and add:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Release APK

```bash
cd mobile/android
./gradlew assembleRelease
cd ..
```

**Tunggu 10-15 menit** untuk build release.

### Step 5: Find Release APK

APK location:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

Copy:
```bash
copy android\app\build\outputs\apk\release\app-release.apk SecureChat-v0.1.0-alpha.apk
```

---

## 📱 Install APK

### Method 1: Via USB (ADB)

```bash
adb install SecureChat-debug.apk
```

### Method 2: Transfer to Phone

1. Copy APK ke HP (via USB, email, atau cloud)
2. Buka file manager di HP
3. Tap APK file
4. Allow "Install from unknown sources" jika diminta
5. Tap "Install"

### Method 3: Share via Link

Upload APK ke:
- Google Drive
- Dropbox
- Firebase App Distribution
- Your own server

---

## 🔧 Build Configuration

### App Name

Edit `mobile/android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">SecureChat</string>
</resources>
```

### App Icon

Replace files in `mobile/android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Version

Edit `mobile/android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.securechat"
        versionCode 1
        versionName "0.1.0-alpha"
    }
}
```

### Permissions

Edit `mobile/android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <!-- Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Camera -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Audio -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <!-- Storage -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Network State -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- WebRTC -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
</manifest>
```

---

## 🐛 Troubleshooting

### Build Failed: "SDK location not found"

Create `mobile/android/local.properties`:

```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Build Failed: "Java heap space"

Edit `mobile/android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

### Build Failed: "Execution failed for task ':app:mergeDebugResources'"

```bash
cd mobile/android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### APK Too Large

Enable ProGuard in `build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

### App Crashes on Install

Check logs:
```bash
adb logcat | findstr "SecureChat"
```

---

## 📊 APK Size

### Expected Sizes:
- **Debug APK:** ~50-80 MB
- **Release APK:** ~30-50 MB (with ProGuard)

### Reduce Size:
1. Enable ProGuard
2. Remove unused resources
3. Use APK Analyzer in Android Studio
4. Split APKs by architecture (advanced)

---

## 🚀 Distribution

### Option 1: Direct Install
- Share APK file directly
- Users install manually
- Good for testing

### Option 2: Firebase App Distribution
- Upload to Firebase
- Invite testers via email
- Track installations
- Good for beta testing

### Option 3: Google Play Store
- Create developer account ($25 one-time)
- Upload APK/AAB
- Fill store listing
- Submit for review
- Good for production

---

## 📝 Build Checklist

Before building APK:

- [ ] Backend URL configured correctly
- [ ] App name set
- [ ] App icon added
- [ ] Version number updated
- [ ] Permissions added
- [ ] Tested on emulator/device
- [ ] All features working
- [ ] No console errors

For Release APK:

- [ ] Signing key generated
- [ ] gradle.properties configured
- [ ] build.gradle updated
- [ ] ProGuard enabled
- [ ] Tested release build
- [ ] APK size acceptable

---

## 🎯 Quick Commands

```bash
# Debug APK (fast)
cd mobile/android
./gradlew assembleDebug

# Release APK (optimized)
cd mobile/android
./gradlew assembleRelease

# Clean build
cd mobile/android
./gradlew clean

# Install to device
adb install app-debug.apk

# Uninstall from device
adb uninstall com.securechat

# Check APK info
aapt dump badging app-debug.apk
```

---

## 📦 Build Output

After successful build:

```
mobile/android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk          (Debug version)
└── release/
    └── app-release.apk        (Release version)
```

---

## ✅ Success!

Jika build berhasil, Anda akan punya:

1. **APK File** - Ready to install
2. **Installable** - Bisa di-install di HP Android
3. **Shareable** - Bisa dibagikan ke orang lain
4. **Testable** - Bisa ditest di device fisik

---

## 🔄 Next Steps

1. **Test APK** di berbagai device
2. **Fix bugs** jika ada
3. **Build Release APK** untuk production
4. **Upload to Play Store** (optional)

---

**Ready to build? Run:**

```bash
cd mobile
build-apk.bat
```

**APK akan tersimpan di:**
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

**Happy building! 🚀**
