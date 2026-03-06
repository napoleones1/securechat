# 📱 SecureChat Mobile App - Setup Guide

Mobile app React Native dengan semua fitur desktop + WhatsApp-style UI.

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 16+
# Install React Native CLI
npm install -g react-native-cli

# For Android
# Install Android Studio
# Install Android SDK (API 31+)
# Setup ANDROID_HOME environment variable

# For iOS (Mac only)
# Install Xcode 14+
# Install CocoaPods
sudo gem install cocoapods
```

### Installation
```bash
cd mobile
npm install

# For iOS
cd ios
pod install
cd ..

# Run Android
npm run android

# Run iOS
npm run ios
```

---

## 📁 Project Structure

```
mobile/
├── App.js                          # Main app entry
├── index.js                        # React Native entry
├── package.json
├── android/                        # Android native code
├── ios/                           # iOS native code
└── src/
    ├── config/
    │   └── api.js                 # API configuration
    ├── context/
    │   ├── AuthContext.js         # Authentication state
    │   └── SocketContext.js       # Socket.io connection
    ├── navigation/
    │   └── MainTabs.js            # Bottom tabs navigation
    ├── screens/
    │   ├── SplashScreen.js        # Splash screen
    │   ├── LoginScreen.js         # Login
    │   ├── RegisterScreen.js      # Register
    │   ├── ChatsListScreen.js     # Chat list (WhatsApp style)
    │   ├── CallsListScreen.js     # Call history
    │   ├── StatusScreen.js        # Status/Stories (future)
    │   ├── SettingsScreen.js      # Settings
    │   ├── ChatScreen.js          # Chat conversation
    │   ├── NewChatScreen.js       # New chat
    │   ├── NewGroupScreen.js      # Create group
    │   ├── ProfileScreen.js       # Edit profile
    │   ├── UserInfoScreen.js      # View user info
    │   ├── GroupInfoScreen.js     # Group info & management
    │   ├── CallScreen.js          # Active call (voice/video)
    │   └── IncomingCallScreen.js  # Incoming call
    ├── components/
    │   ├── ChatItem.js            # Chat list item
    │   ├── MessageBubble.js       # Message bubble
    │   ├── MessageInput.js        # Message input with attach
    │   ├── VoiceRecorder.js       # Voice message recorder
    │   ├── FilePreview.js         # File preview
    │   ├── Avatar.js              # User avatar
    │   ├── StatusBadge.js         # Online/offline badge
    │   ├── TypingIndicator.js     # Typing animation
    │   └── CallButton.js          # Call buttons
    ├── services/
    │   ├── api.js                 # API service
    │   ├── socketService.js       # Socket service
    │   ├── callService.js         # WebRTC call service
    │   ├── fileService.js         # File upload/download
    │   └── notificationService.js # Push notifications
    ├── utils/
    │   ├── formatDate.js          # Date formatting
    │   ├── formatFileSize.js      # File size formatting
    │   └── permissions.js         # Permission helpers
    └── styles/
        ├── colors.js              # Color palette
        └── common.js              # Common styles
```

---

## 🎨 Design System (WhatsApp Style)

### Colors
```javascript
// Primary
PRIMARY: '#075E54'      // Dark green (header)
PRIMARY_LIGHT: '#128C7E' // Light green
ACCENT: '#25D366'       // WhatsApp green
ACCENT_DARK: '#075E54'

// Background
BG_PRIMARY: '#FFFFFF'   // White
BG_SECONDARY: '#F0F2F5' // Light gray
BG_CHAT: '#ECE5DD'      // Chat background

// Message Bubbles
BUBBLE_SENT: '#DCF8C6'  // Light green (sent)
BUBBLE_RECEIVED: '#FFFFFF' // White (received)

// Text
TEXT_PRIMARY: '#000000'
TEXT_SECONDARY: '#667781'
TEXT_TERTIARY: '#8696A0'

// Status
ONLINE: '#25D366'
OFFLINE: '#8696A0'
TYPING: '#075E54'

// Call
CALL_ACCEPT: '#4CAF50'
CALL_REJECT: '#F44336'
CALL_END: '#F44336'
```

### Typography
```javascript
// Font Sizes
FONT_XS: 12
FONT_SM: 14
FONT_MD: 16
FONT_LG: 18
FONT_XL: 20
FONT_XXL: 24

// Font Weights
WEIGHT_REGULAR: '400'
WEIGHT_MEDIUM: '500'
WEIGHT_SEMIBOLD: '600'
WEIGHT_BOLD: '700'
```

---

## 📱 Screens Overview

### 1. SplashScreen
- App logo
- Loading indicator
- Auto-navigate to Login or Main

### 2. LoginScreen
- Email/Username input
- Password input
- Login button
- Register link
- WhatsApp-style green theme

### 3. RegisterScreen
- Email input
- Name input
- Username input (with @ prefix)
- Password input
- Register button
- Login link

### 4. MainTabs (Bottom Navigation)
```
┌─────────────────────────────────┐
│  CHATS  │  CALLS  │  SETTINGS   │
└─────────────────────────────────┘
```

#### 4.1 ChatsListScreen
- Search bar
- Chat list (FlatList)
- Each item shows:
  - Avatar
  - Name with badges
  - Last message
  - Timestamp
  - Unread count badge
  - Online status
- FAB button (New Chat)
- Long press for options

#### 4.2 CallsListScreen
- Call history list
- Each item shows:
  - Avatar
  - Name
  - Call type icon (voice/video)
  - Call status (missed, incoming, outgoing)
  - Timestamp
  - Duration
- Tap to call back

#### 4.3 SettingsScreen
- Profile section (avatar, name, bio)
- Account settings
- Notifications
- Privacy
- Help
- About
- Logout

### 5. ChatScreen (WhatsApp Style)
```
┌─────────────────────────────────┐
│ ← [Avatar] Name ✓        📞 📹 ⋮│ Header
├─────────────────────────────────┤
│                                 │
│  ┌──────────────┐              │
│  │ Received msg │              │
│  └──────────────┘              │
│              ┌──────────────┐  │
│              │ Sent message │  │
│              │          ✓✓  │  │
│              └──────────────┘  │
│                                 │
│  [Image preview]                │
│  [Video preview]                │
│  [Voice message waveform]       │
│  [File attachment]              │
│                                 │
├─────────────────────────────────┤
│ 😊 │ Type a message...  │ 📎 🎤│ Input
└─────────────────────────────────┘
```

Features:
- Message list (FlatList inverted)
- Message bubbles (sent/received)
- Message status (✓, ✓✓, ✓✓ green)
- Typing indicator
- File attachments (image, video, voice, file)
- Voice message recorder (press & hold)
- Emoji picker
- Call buttons (voice, video)
- 3-dot menu (group info, clear chat, etc)

### 6. NewChatScreen
- Search users
- User list
- Tap to start chat
- Show online status

### 7. NewGroupScreen
- Group name input
- Group bio input (optional)
- Group avatar picker
- Select members (multi-select)
- Create button

### 8. ProfileScreen
- Edit avatar
- Edit name
- Edit username (with availability check)
- Edit bio
- Save button

### 9. UserInfoScreen
- View user avatar (tap to enlarge)
- Name with badges
- Username
- Bio
- Online status / Last seen
- Actions: Message, Call, Video Call

### 10. GroupInfoScreen
- Group avatar (tap to enlarge)
- Group name
- Group bio
- Created by
- Members list with roles
- Admin actions:
  - Edit group
  - Add members
  - Remove members
  - Promote/demote
- Leave group button

### 11. CallScreen (Fullscreen)
```
┌─────────────────────────────────┐
│                                 │
│         [Remote Video]          │ Video call
│                                 │
│    ┌──────┐                    │
│    │Local │                    │ PiP
│    └──────┘                    │
│                                 │
│         [Avatar]                │ Voice call
│         Name                    │
│         00:42                   │
│                                 │
│                                 │
│    🎤    📹    📴              │ Controls
│   Mute  Video  End             │
│                                 │
└─────────────────────────────────┘
```

Features:
- Fullscreen layout
- Remote video (video calls)
- Local video PiP (video calls)
- Avatar & name (voice calls)
- Call timer
- Mute button
- Toggle video button (video calls)
- End call button
- Minimize to floating window

### 12. IncomingCallScreen
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         [Avatar]                │
│                                 │
│         Name                    │
│     📞 Incoming Call...         │
│                                 │
│                                 │
│                                 │
│    ✓ Answer    ✗ Reject        │
│                                 │
└─────────────────────────────────┘
```

---

## 🔧 Key Features Implementation

### 1. Real-Time Messaging
```javascript
// Send message
socket.emit('message:send', {
  chatId,
  content,
  messageType: 'text'
});

// Receive message
socket.on('message:new', (message) => {
  // Add to chat
});

// Typing indicator
socket.emit('typing:start', { chatId });
socket.emit('typing:stop', { chatId });
```

### 2. File Sharing
```javascript
// Pick image
import { launchImageLibrary } from 'react-native-image-picker';

// Pick document
import DocumentPicker from 'react-native-document-picker';

// Upload file
const formData = new FormData();
formData.append('file', {
  uri: file.uri,
  type: file.type,
  name: file.name,
});
```

### 3. Voice Messages
```javascript
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

// Start recording
await audioRecorderPlayer.startRecorder();

// Stop recording
const result = await audioRecorderPlayer.stopRecorder();

// Upload voice message
```

### 4. Voice/Video Calls (WebRTC)
```javascript
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

// Get local stream
const stream = await mediaDevices.getUserMedia({
  audio: true,
  video: isVideoCall,
});

// Create peer connection
const pc = new RTCPeerConnection(iceServers);

// Add stream
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

// Create offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Send offer via socket
socket.emit('webrtc:offer', { offer, receiverId });
```

### 5. Push Notifications
```javascript
// Setup notifications
import messaging from '@react-native-firebase/messaging';

// Request permission
await messaging().requestPermission();

// Get FCM token
const token = await messaging().getToken();

// Handle foreground messages
messaging().onMessage(async remoteMessage => {
  // Show notification
});

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Handle notification
});
```

---

## 🎯 WhatsApp-Style UI Components

### ChatItem Component
```jsx
<TouchableOpacity style={styles.chatItem}>
  <Avatar uri={avatar} size={50} online={isOnline} />
  <View style={styles.chatInfo}>
    <View style={styles.chatHeader}>
      <Text style={styles.chatName}>{name} {badges}</Text>
      <Text style={styles.chatTime}>{time}</Text>
    </View>
    <View style={styles.chatFooter}>
      <Text style={styles.lastMessage} numberOfLines={1}>
        {lastMessage}
      </Text>
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  </View>
</TouchableOpacity>
```

### MessageBubble Component
```jsx
<View style={[
  styles.bubble,
  isSent ? styles.bubbleSent : styles.bubbleReceived
]}>
  {messageType === 'text' && (
    <Text style={styles.messageText}>{content}</Text>
  )}
  {messageType === 'image' && (
    <Image source={{ uri: fileUrl }} style={styles.messageImage} />
  )}
  {messageType === 'voice' && (
    <VoicePlayer uri={fileUrl} duration={duration} />
  )}
  <View style={styles.messageFooter}>
    <Text style={styles.messageTime}>{time}</Text>
    {isSent && <MessageStatus status={status} />}
  </View>
</View>
```

### VoiceRecorder Component
```jsx
<TouchableOpacity
  onPressIn={startRecording}
  onPressOut={stopRecording}
  style={styles.micButton}>
  <Icon name="microphone" size={24} color="#fff" />
  {isRecording && (
    <View style={styles.recordingIndicator}>
      <Text style={styles.recordingTime}>{recordingTime}</Text>
      <Text style={styles.recordingHint}>← Slide to cancel</Text>
    </View>
  )}
</TouchableOpacity>
```

---

## 📦 Dependencies Explained

### Core
- `react-native` - Framework
- `react-navigation` - Navigation
- `@react-native-async-storage/async-storage` - Local storage

### Networking
- `axios` - HTTP client
- `socket.io-client` - Real-time communication

### Media
- `react-native-image-picker` - Image picker
- `react-native-document-picker` - Document picker
- `react-native-audio-recorder-player` - Voice messages
- `react-native-video` - Video player
- `react-native-fast-image` - Optimized images

### Calls
- `react-native-webrtc` - WebRTC for calls

### UI
- `react-native-vector-icons` - Icons
- `react-native-gesture-handler` - Gestures
- `react-native-reanimated` - Animations

### Permissions
- `react-native-permissions` - Permission handling
- `react-native-fs` - File system access

---

## 🔐 Permissions Required

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS (ios/SecureChat/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for video calls and photos</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for calls and voice messages</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to send images</string>
```

---

## 🚀 Build & Release

### Android APK
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Android AAB (Play Store)
```bash
cd android
./gradlew bundleRelease
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS (Xcode)
```bash
cd ios
open SecureChat.xcworkspace
# Build in Xcode
# Product → Archive
```

---

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Setup Android/iOS environment
3. Run app: `npm run android` or `npm run ios`
4. Test all features
5. Build release version

---

**Version:** 0.1.0-alpha  
**Platform:** iOS & Android  
**Min SDK:** Android 24+ (7.0), iOS 13+
