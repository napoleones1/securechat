# 🔧 Initialize React Native Project

## ⚠️ PENTING: Project Belum Di-Initialize!

Project ini baru berisi source code saja. Untuk build APK, perlu initialize React Native project terlebih dahulu.

---

## 🚀 Cara Initialize Project

### Opsi 1: Initialize dari Scratch (RECOMMENDED)

#### Step 1: Backup Source Code
```bash
# Backup folder src
xcopy mobile\src mobile_src_backup\ /E /I
```

#### Step 2: Create New React Native Project
```bash
npx react-native init SecureChat --version 0.73.2
```

#### Step 3: Copy Source Code
```bash
# Copy semua file dari mobile/ ke SecureChat/
xcopy mobile\src SecureChat\src\ /E /I
xcopy mobile\package.json SecureChat\package.json /Y
```

#### Step 4: Install Dependencies
```bash
cd SecureChat
npm install
```

#### Step 5: Build APK
```bash
cd android
gradlew assembleDebug
```

---

### Opsi 2: Initialize Android Only

#### Step 1: Install React Native CLI
```bash
npm install -g react-native-cli
```

#### Step 2: Initialize Android
```bash
cd mobile
npx react-native init TempProject --version 0.73.2
```

#### Step 3: Copy Android Folder
```bash
xcopy TempProject\android mobile\android\ /E /I
```

#### Step 4: Update package.json
Pastikan ada scripts:
```json
{
  "scripts": {
    "android": "react-native run-android",
    "start": "react-native start"
  }
}
```

#### Step 5: Install Dependencies
```bash
npm install
```

#### Step 6: Build APK
```bash
cd android
gradlew assembleDebug
```

---

## 🎯 Cara Tercepat (Menggunakan Template)

Saya akan buatkan script untuk initialize project secara otomatis.

### Step 1: Run Initialize Script
```bash
cd mobile
initialize-project.bat
```

Script ini akan:
1. Create new React Native project
2. Copy source code
3. Install dependencies
4. Setup Android project
5. Ready to build APK

---

## 📝 Manual Steps (Jika Script Gagal)

### 1. Create New Project
```bash
npx react-native@0.73.2 init SecureChat
```

### 2. Replace Files
Copy dari `mobile/` ke `SecureChat/`:
- `src/` folder
- `package.json`
- `App.js`
- `index.js`

### 3. Install Dependencies
```bash
cd SecureChat
npm install
```

### 4. Link Assets (if needed)
```bash
npx react-native-asset
```

### 5. Build APK
```bash
cd android
gradlew assembleDebug
```

---

## ⚡ Alternative: Use Expo (Easier)

Jika ingin cara lebih mudah, bisa convert ke Expo:

### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 2: Create Expo Project
```bash
expo init SecureChatExpo
# Choose "blank" template
```

### Step 3: Copy Source Code
Copy semua dari `mobile/src/` ke `SecureChatExpo/`

### Step 4: Update Dependencies
Edit `package.json` dan install dependencies

### Step 5: Build APK
```bash
expo build:android
```

**Note:** Expo build dilakukan di cloud, tidak perlu Android Studio.

---

## 🔍 Kenapa Ini Terjadi?

Project ini dibuat dengan struktur code saja, tanpa initialize React Native project. Untuk build APK, perlu:

1. **Android Project Structure** (`android/` folder)
2. **Gradle Configuration** (`build.gradle`, dll)
3. **Native Modules** (linked)
4. **Metro Bundler** (configured)

Semua ini di-generate otomatis saat run `react-native init`.

---

## 💡 Rekomendasi

**Untuk Anda:**

1. **Gunakan Opsi 1** (Initialize dari Scratch)
   - Paling clean
   - Paling reliable
   - Semua dependencies ter-setup dengan benar

2. **Atau gunakan Expo**
   - Lebih mudah
   - Tidak perlu Android Studio
   - Build di cloud
   - Tapi beberapa native modules mungkin tidak support

---

## 🆘 Need Help?

Jika bingung, saya bisa buatkan:
1. Script otomatis untuk initialize
2. Step-by-step guide dengan screenshot
3. Video tutorial

---

**Next Step:**

Pilih salah satu opsi di atas, lalu jalankan. Setelah project ter-initialize, baru bisa build APK.

Atau saya bisa buatkan script `initialize-project.bat` yang akan melakukan semua step otomatis?
