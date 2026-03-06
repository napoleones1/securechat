# 🚀 How to Run SecureChat Mobile App

Panduan lengkap untuk menjalankan mobile app di Android/iOS.

---

## ⚠️ Prerequisites

### 1. Install Node.js
```bash
# Check if installed
node --version  # Should be 16+
npm --version
```

### 2. Install React Native CLI
```bash
npm install -g react-native-cli
```

### 3. For Android Development

#### Install Android Studio
1. Download dari https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → More Actions → SDK Manager
4. Install:
   - Android SDK Platform 31 (Android 12)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

#### Setup Environment Variables
**Windows:**
```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\emulator
Path += %ANDROID_HOME%\tools
Path += %ANDROID_HOME%\tools\bin
```

**Mac/Linux:**
```bash
# Add to ~/.bash_profile or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. For iOS Development (Mac Only)

#### Install Xcode
```bash
# Install from App Store
# Then install Command Line Tools
xcode-select --install
```

#### Install CocoaPods
```bash
sudo gem install cocoapods
```

---

## 📦 Installation

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. For iOS - Install Pods
```bash
cd ios
pod install
cd ..
```

---

## 🔧 Configuration

### 1. Update API URL

Edit `mobile/src/config/api.js`:

```javascript
// For Android Emulator
export const API_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
export const API_URL = 'http://localhost:5000/api';

// For Physical Device (use your computer's IP)
export const API_URL = 'http://192.168.1.100:5000/api';
```

### 2. Find Your Computer's IP

**Windows:**
```bash
ipconfig
# Look for IPv4 Address
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet address
```

---

## 🏃 Running the App

### Start Backend Server First!
```bash
# In backend directory
cd backend
npm start
# Backend should run on http://localhost:5000
```

### Start Metro Bundler
```bash
# In mobile directory
cd mobile
npm start
```

### Run on Android
```bash
# In new terminal (keep Metro running)
cd mobile
npm run android

# Or with specific device
npx react-native run-android --deviceId=DEVICE_ID
```

### Run on iOS
```bash
# In new terminal (keep Metro running)
cd mobile
npm run ios

# Or with specific simulator
npx react-native run-ios --simulator="iPhone 14"
```

---

## 📱 Testing on Physical Device

### Android

#### 1. Enable Developer Options
1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back → Developer Options
4. Enable "USB Debugging"

#### 2. Connect Device
```bash
# Check if device is connected
adb devices

# Run app
npm run android
```

### iOS

#### 1. Connect iPhone
1. Connect via USB
2. Trust computer on iPhone
3. Open Xcode
4. Select your device
5. Run from Xcode or:

```bash
npx react-native run-ios --device="Your iPhone Name"
```

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

### Android Build Issues
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### iOS Build Issues
```bash
# Clean build
cd ios
xcodebuild clean
pod install
cd ..

# Rebuild
npm run ios
```

### Port Already in Use
```bash
# Kill process on port 8081 (Metro)
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

### Cannot Connect to Backend
1. Check backend is running: `http://localhost:5000/api/health`
2. Check firewall settings
3. For physical device, use computer's IP address
4. Make sure device and computer are on same WiFi network

---

## 📸 Screenshots & Demo

### Current Screens Implemented:
- ✅ Splash Screen
- ✅ Login Screen
- ✅ Register Screen
- ✅ Main Tabs (Chats, Calls, Settings)
- 🚧 Chat List (placeholder)
- 🚧 Chat Screen (placeholder)
- 🚧 Other screens (placeholder)

### To Test:
1. Start backend server
2. Run mobile app
3. Register new account
4. Login
5. Navigate through tabs

---

## 🔑 Test Accounts

### Admin Account
```
Email: admin@securechat.com
Password: Admin@123456
```

### Create New User
Use Register screen to create test accounts

---

## 📝 Development Workflow

### 1. Make Changes
Edit files in `mobile/src/`

### 2. Hot Reload
- Press `R` twice in Metro terminal
- Or shake device → Reload

### 3. Debug
- Shake device → Debug
- Or press `Ctrl+M` (Android) / `Cmd+D` (iOS)
- Select "Debug"

### 4. View Logs
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

---

## 🎨 Current Implementation Status

### ✅ Completed
- Project setup
- Dependencies installed
- Navigation structure
- Auth screens (Splash, Login, Register)
- Main tabs navigation
- API service
- Socket service
- Auth context
- Color system

### 🚧 In Progress
- Chat list screen
- Chat screen
- Message components
- File sharing
- Voice messages
- Calls

### 📋 Planned
- Push notifications
- Background sync
- Offline support
- Performance optimization

---

## 🔄 Next Steps

### Phase 1: Complete Core Screens
```bash
# Create placeholder screens
mobile/src/screens/ChatsListScreen.js
mobile/src/screens/CallsListScreen.js
mobile/src/screens/SettingsScreen.js
mobile/src/screens/ChatScreen.js
mobile/src/screens/NewChatScreen.js
mobile/src/screens/NewGroupScreen.js
mobile/src/screens/ProfileScreen.js
mobile/src/screens/UserInfoScreen.js
mobile/src/screens/GroupInfoScreen.js
mobile/src/screens/CallScreen.js
mobile/src/screens/IncomingCallScreen.js
```

### Phase 2: Implement Components
```bash
mobile/src/components/ChatItem.js
mobile/src/components/MessageBubble.js
mobile/src/components/MessageInput.js
mobile/src/components/Avatar.js
mobile/src/components/VoiceRecorder.js
```

### Phase 3: Add Features
- Real-time messaging
- File sharing
- Voice messages
- Calls (WebRTC)

---

## 📚 Useful Commands

```bash
# Install new package
npm install package-name

# Update dependencies
npm update

# Check for issues
npx react-native doctor

# List devices
adb devices  # Android
xcrun simctl list devices  # iOS

# Uninstall app
adb uninstall com.securechat  # Android

# Take screenshot
adb shell screencap -p /sdcard/screen.png  # Android
```

---

## 🆘 Getting Help

### Documentation
- React Native: https://reactnative.dev/docs/getting-started
- React Navigation: https://reactnavigation.org/docs/getting-started

### Common Issues
1. **Metro won't start**: Clear cache and restart
2. **Build fails**: Clean build and rebuild
3. **Can't connect to backend**: Check API URL and network
4. **App crashes**: Check logs for errors

---

## ✅ Checklist Before Running

- [ ] Node.js installed (16+)
- [ ] React Native CLI installed
- [ ] Android Studio / Xcode installed
- [ ] Environment variables set
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server running
- [ ] API URL configured correctly
- [ ] Device/emulator ready

---

**Ready to run?**

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Metro
cd mobile && npm start

# Terminal 3: Run App
cd mobile && npm run android  # or npm run ios
```

**Happy coding! 🚀**
