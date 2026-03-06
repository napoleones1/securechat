# SecureChat - Quick Start Guide

Panduan cepat untuk menjalankan aplikasi dalam 5 menit!

## Prerequisites

Pastikan sudah terinstall:
- Node.js (v18+)
- MongoDB
- npm atau yarn

## 🚀 Quick Start - Backend

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Edit .env (opsional, bisa pakai default)
# Minimal yang perlu diganti: JWT_SECRET

# 5. Start MongoDB (jika belum running)
# Windows: mongod
# Mac/Linux: sudo systemctl start mongod

# 6. Start server
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📱 Quick Start - Mobile

```bash
# 1. Masuk ke folder mobile
cd mobile

# 2. Install dependencies
npm install

# 3. Untuk iOS (Mac only), install pods
cd ios && pod install && cd ..

# 4. Start Metro bundler
npm start

# 5. Di terminal baru, run app
# Android:
npm run android

# iOS (Mac only):
npm run ios
```

## 💻 Quick Start - Desktop

```bash
# 1. Masuk ke folder desktop
cd desktop

# 2. Install dependencies
npm install

# 3. Start app
npm start
```

## ✅ Testing

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Atau buka di browser:
http://localhost:5000/health
```

### 2. Test Mobile/Desktop App

1. Register akun baru
2. Login dengan akun tersebut
3. Buka app di device/window lain
4. Register akun kedua
5. Search user pertama dan mulai chat
6. Test kirim pesan real-time!

## 🔧 Troubleshooting Cepat

### Backend tidak start
```bash
# Cek apakah MongoDB running
# Windows: tasklist | findstr mongod
# Mac/Linux: ps aux | grep mongod

# Cek apakah port 5000 sudah dipakai
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Mobile tidak connect ke backend

Jika pakai device fisik, edit `mobile/src/config/api.js`:

```javascript
// Ganti localhost dengan IP komputer Anda
export const API_URL = 'http://192.168.1.100:5000';
```

Cara cek IP:
- Windows: `ipconfig` (lihat IPv4 Address)
- Mac/Linux: `ifconfig` atau `ip addr`

### React Native build error

```bash
cd mobile

# Clear cache
npm start -- --reset-cache

# Android: Clean build
cd android && ./gradlew clean && cd ..

# iOS: Reinstall pods
cd ios && pod deintegrate && pod install && cd ..
```

## 📝 Default Credentials untuk Testing

Tidak ada default credentials. Anda perlu register akun baru.

Contoh data untuk testing:
- Username: testuser
- Email: test@example.com
- Password: password123

## 🎯 Next Steps

Setelah berhasil running:

1. ✅ Test semua fitur Phase Medium
2. ✅ Baca FEATURES.md untuk detail fitur
3. ✅ Baca SETUP_GUIDE.md untuk setup lengkap
4. ✅ Siap untuk Phase Advanced!

## 💡 Tips

- Gunakan 2 device/window untuk test real-time messaging
- Check console untuk debug info
- MongoDB Compass untuk lihat database
- Postman untuk test API endpoints

## 🆘 Butuh Bantuan?

Jika ada error atau masalah, tanyakan saja! Saya siap membantu troubleshoot.

## 📚 Dokumentasi Lengkap

- `README.md` - Overview project
- `SETUP_GUIDE.md` - Setup detail
- `FEATURES.md` - Daftar fitur lengkap
- `backend/` - API documentation
- `mobile/` - Mobile app docs
- `desktop/` - Desktop app docs
