# SecureChat - Setup Guide

## Prerequisites

Pastikan Anda sudah menginstall:

1. **Node.js** (v18 atau lebih tinggi)
   - Download: https://nodejs.org/

2. **MongoDB** (v6 atau lebih tinggi)
   - Download: https://www.mongodb.com/try/download/community
   - Atau gunakan MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **React Native Development Environment**
   
   Untuk Android:
   - Android Studio
   - Android SDK
   - Java Development Kit (JDK)
   
   Untuk iOS (Mac only):
   - Xcode
   - CocoaPods
   
   Panduan lengkap: https://reactnative.dev/docs/environment-setup

## Setup Backend

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di folder `backend`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/securechat
JWT_SECRET=ganti_dengan_secret_key_yang_aman_dan_random
JWT_EXPIRE=7d
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Start MongoDB

Jika menggunakan MongoDB lokal:

```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

### 4. Run Backend Server

```bash
npm start
# atau untuk development dengan auto-reload:
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Setup Mobile App

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit file `mobile/src/config/api.js`:

```javascript
// Untuk testing di emulator/simulator:
export const API_URL = 'http://localhost:5000';

// Untuk testing di device fisik, ganti dengan IP komputer Anda:
// export const API_URL = 'http://192.168.1.100:5000';
```

Cara cek IP komputer:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` atau `ip addr`

### 3. Install iOS Dependencies (Mac only)

```bash
cd ios
pod install
cd ..
```

### 4. Run Mobile App

Untuk Android:

```bash
npm run android
```

Untuk iOS (Mac only):

```bash
npm run ios
```

## Setup Desktop App (Electron)

### 1. Install Dependencies

```bash
cd desktop
npm install
```

### 2. Configure API URL

Edit file `desktop/src/config/api.js` (sama seperti mobile)

### 3. Run Desktop App

```bash
npm start
```

### 4. Build Desktop App

```bash
# Build untuk Windows
npm run build:win

# Build untuk Mac
npm run build:mac

# Build untuk Linux
npm run build:linux
```

## Testing

### Test Backend API

Gunakan Postman atau curl:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Mobile App

1. Buka emulator/simulator atau hubungkan device fisik
2. Jalankan `npm run android` atau `npm run ios`
3. Register akun baru
4. Login dan test fitur chat

## Troubleshooting

### Backend tidak bisa connect ke MongoDB

- Pastikan MongoDB service sudah running
- Cek connection string di `.env`
- Cek firewall tidak memblokir port 27017

### Mobile app tidak bisa connect ke backend

- Pastikan backend server sudah running
- Cek API_URL di `config/api.js`
- Jika pakai device fisik, pastikan di network yang sama dengan komputer
- Disable firewall sementara untuk testing

### React Native build error

```bash
# Clear cache
cd mobile
npm start -- --reset-cache

# Clean Android build
cd android
./gradlew clean
cd ..

# Clean iOS build (Mac only)
cd ios
pod deintegrate
pod install
cd ..
```

### Port sudah digunakan

Ganti port di backend `.env`:

```env
PORT=5001
```

Dan update di mobile/desktop `config/api.js`

## Next Steps - Phase Advanced

Setelah Phase Medium berjalan dengan baik, kita akan implement:

1. Voice/Video Call dengan WebRTC
2. End-to-end Encryption
3. Voice Messages
4. Stories/Status
5. Message Reactions
6. Push Notifications yang lebih advanced

## Support

Jika ada masalah, tanyakan saja dan saya akan bantu troubleshoot!
