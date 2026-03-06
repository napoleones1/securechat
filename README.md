# 💬 SecureChat - Real-time Messaging App

A full-stack real-time messaging application with desktop (Electron) and mobile (React Native/Expo) versions.

## ✨ Features

### � Authentication
- User registration with email/username
- Secure login with JWT tokens
- Profile management with avatar upload
- Online/offline status

### � Messaging
- Real-time text messaging
- Image sharing
- Video sharing
- File sharing
- Voice messages
- Typing indicators
- Message read receipts
- Message timestamps

### 👥 Group Chats
- Create group chats
- Add/remove members
- Group admin controls
- Group avatar
- Group info management

### 📞 Voice & Video Calls
- One-on-one voice calls
- One-on-one video calls
- Call history
- Incoming call notifications
- WebRTC integration

### 🎨 UI/UX
- WhatsApp-inspired design
- Dark/Light theme support
- Responsive layout
- Smooth animations
- Native feel on mobile

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads

### Desktop (Electron)
- **Electron** - Desktop framework
- **HTML/CSS/JavaScript** - Frontend
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client

### Mobile (React Native/Expo)
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **Expo Image Picker** - Image/video selection
- **Expo Document Picker** - File selection

## 📁 Project Structure

```
securechat/
├── backend/              # Backend server
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.io handlers
│   ├── uploads/         # Uploaded files
│   └── server.js        # Main server file
│
├── desktop/             # Electron desktop app
│   ├── src/            # Source files
│   ├── styles/         # CSS styles
│   ├── index.html      # Main HTML
│   ├── main.js         # Electron main process
│   └── package.json    # Dependencies
│
└── SecureChatMinimal/   # React Native mobile app
    ├── src/
    │   ├── components/ # Reusable components
    │   ├── config/     # API configuration
    │   ├── context/    # React context (Auth, Socket)
    │   ├── navigation/ # Navigation setup
    │   ├── screens/    # App screens
    │   ├── services/   # API services
    │   └── styles/     # Style constants
    ├── App.js          # Main app component
    ├── app.json        # Expo configuration
    └── package.json    # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Expo CLI (for mobile development)
- Android Studio or Xcode (for mobile builds)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the server:
```bash
npm start
```

Server will run on `http://localhost:5000`

### Desktop Setup

1. Navigate to desktop directory:
```bash
cd desktop
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/config/api.js`:
```javascript
export const API_URL = 'http://localhost:5000/api';
```

4. Start the app:
```bash
npm start
```

### Mobile Setup

1. Navigate to mobile directory:
```bash
cd SecureChatMinimal
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/config/api.js`:
```javascript
// For local development (same WiFi)
export const API_URL = 'http://YOUR_IP:5000/api';
export const SOCKET_URL = 'http://YOUR_IP:5000';

// For production (ngrok or deployed backend)
export const API_URL = 'https://your-backend-url.com/api';
export const SOCKET_URL = 'https://your-backend-url.com';
```

4. Start Expo:
```bash
npx expo start
```

5. Scan QR code with Expo Go app (Android/iOS)

### Building Mobile APK

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure build:
```bash
eas build:configure
```

4. Build APK:
```bash
eas build --platform android --profile preview
```

5. Download APK from the provided link

## 🌐 Deployment

### Backend Deployment (Vercel/Heroku/Railway)

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Deploy

### Desktop Distribution

1. Build for your platform:
```bash
npm run build
```

2. Distribute the executable

### Mobile Distribution

1. Build APK/IPA using EAS Build
2. Distribute via:
   - Google Play Store (Android)
   - Apple App Store (iOS)
   - Direct APK download

## � Mobidle App Features

All desktop features are available on mobile:
- ✅ Authentication (Login/Register)
- ✅ Real-time messaging
- ✅ Image/Video/File sharing
- ✅ Group chats
- ✅ Voice & Video calls
- ✅ Profile management
- ✅ Settings
- ✅ Call history

## � Security

- JWT-based authentication
- Password hashing with bcrypt
- Secure WebSocket connections
- File upload validation
- XSS protection
- CORS configuration

## � API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/avatar` - Upload avatar

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat by ID
- `POST /api/chats/:id/messages` - Send message

### Groups
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member

### Calls
- `GET /api/calls` - Get call history
- `POST /api/calls` - Create call record

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Muhamad Haikal**

## 🙏 Acknowledgments

- WhatsApp for UI/UX inspiration
- Socket.io for real-time communication
- Expo for mobile development platform
- MongoDB Atlas for database hosting

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

Made with ❤️ by Muhamad Haikal
