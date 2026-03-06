# 📱 SecureChat Mobile App

React Native mobile application dengan WhatsApp-style UI untuk SecureChat.

---

## 🎯 Status: Alpha v0.1

### ✅ Implemented
- Splash Screen dengan auto-login
- Login Screen (email/username)
- Register Screen dengan username checker
- Main Tabs Navigation (Chats, Calls, Settings)
- Chats List Screen dengan search
- Settings Screen dengan profile
- API Service dengan interceptors
- Socket Service untuk real-time
- Auth Context untuk state management
- WhatsApp-style color system

### 🚧 In Progress
- Chat Screen (messaging)
- File sharing
- Voice messages
- Calls (WebRTC)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. For iOS (Mac only)
```bash
cd ios
pod install
cd ..
```

### 3. Configure API URL
Edit `src/config/api.js`:
```javascript
// For Android Emulator
export const API_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
export const API_URL = 'http://localhost:5000/api';

// For Physical Device
export const API_URL = 'http://YOUR_IP:5000/api';
```

### 4. Start Backend
```bash
cd ../backend
npm start
```

### 5. Run Mobile App
```bash
# Terminal 1: Metro Bundler
cd mobile
npm start

# Terminal 2: Run App
npm run android  # or npm run ios
```

---

## 📱 Screenshots

### Current Screens
1. **Splash Screen** - Logo + loading
2. **Login Screen** - Email/username + password
3. **Register Screen** - Full registration with username checker
4. **Main Tabs** - Chats, Calls, Settings
5. **Chats List** - WhatsApp-style chat list
6. **Settings** - Profile + app settings

---

## 🎨 Design System

### Colors (WhatsApp Style)
- Primary: `#075E54` (Dark green)
- Accent: `#25D366` (WhatsApp green)
- Bubble Sent: `#DCF8C6` (Light green)
- Bubble Received: `#FFFFFF` (White)
- Background Chat: `#ECE5DD` (Beige)

### Navigation
- Bottom Tabs: Chats, Calls, Settings
- Stack Navigation untuk screens
- Material Top Tabs untuk main tabs

---

## 📦 Dependencies

### Core
- react-native: 0.73.2
- react: 18.2.0

### Navigation
- @react-navigation/native
- @react-navigation/stack
- @react-navigation/bottom-tabs
- @react-navigation/material-top-tabs

### Networking
- axios
- socket.io-client

### Storage
- @react-native-async-storage/async-storage

### UI
- react-native-vector-icons
- react-native-gesture-handler
- react-native-reanimated

### Media (Planned)
- react-native-image-picker
- react-native-document-picker
- react-native-audio-recorder-player
- react-native-webrtc

---

## 🔧 Configuration

### Android
1. Install Android Studio
2. Setup Android SDK (API 31+)
3. Setup ANDROID_HOME environment variable
4. Enable USB Debugging on device

### iOS (Mac only)
1. Install Xcode
2. Install CocoaPods
3. Run `pod install` in ios folder

---

## 🐛 Troubleshooting

### Metro won't start
```bash
npm start -- --reset-cache
```

### Build fails
```bash
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && xcodebuild clean && cd ..
```

### Can't connect to backend
1. Check backend is running
2. Check API_URL in config
3. For physical device, use computer's IP
4. Make sure on same WiFi network

---

## 📝 Development

### File Structure
```
mobile/
├── App.js                    # Main app entry
├── src/
│   ├── config/
│   │   └── api.js           # API configuration
│   ├── context/
│   │   ├── AuthContext.js   # Auth state
│   │   └── SocketContext.js # Socket connection
│   ├── navigation/
│   │   └── MainTabs.js      # Bottom tabs
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── ChatsListScreen.js
│   │   ├── CallsListScreen.js
│   │   ├── SettingsScreen.js
│   │   └── ... (other screens)
│   ├── services/
│   │   └── api.js           # API service
│   └── styles/
│       └── colors.js        # Color palette
```

### Adding New Screen
1. Create screen in `src/screens/`
2. Add to navigation in `App.js`
3. Import and use

### Making API Calls
```javascript
import api from '../services/api';

const response = await api.get('/endpoint');
const data = await api.post('/endpoint', { data });
```

### Using Socket
```javascript
import { useSocket } from '../context/SocketContext';

const { emit, on, off } = useSocket();

// Emit event
emit('event:name', data);

// Listen to event
on('event:name', (data) => {
  // Handle data
});

// Cleanup
off('event:name', handler);
```

---

## 🎯 Next Steps

### Phase 1: Complete Messaging
- [ ] Implement ChatScreen
- [ ] Message bubbles
- [ ] Message input
- [ ] File attachments
- [ ] Voice messages

### Phase 2: Calls
- [ ] WebRTC integration
- [ ] Call screens
- [ ] Call controls

### Phase 3: Polish
- [ ] Push notifications
- [ ] Offline support
- [ ] Performance optimization

---

## 📚 Documentation

- [HOW_TO_RUN.md](HOW_TO_RUN.md) - Detailed setup guide
- [MOBILE_SETUP.md](MOBILE_SETUP.md) - Complete documentation
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Implementation details

---

## 🆘 Need Help?

1. Check [HOW_TO_RUN.md](HOW_TO_RUN.md)
2. Check React Native docs: https://reactnative.dev
3. Check React Navigation docs: https://reactnavigation.org
4. Create issue on GitHub

---

## ✅ Checklist

Before running:
- [ ] Node.js installed (16+)
- [ ] React Native CLI installed
- [ ] Android Studio / Xcode installed
- [ ] Dependencies installed
- [ ] Backend running
- [ ] API URL configured
- [ ] Device/emulator ready

---

**Version:** 0.1.0-alpha  
**Platform:** iOS & Android  
**Min SDK:** Android 24+ (7.0), iOS 13+

**Ready to run!** 🚀

```bash
# Start backend
cd backend && npm start

# Start mobile
cd mobile && npm start
npm run android  # or npm run ios
```
