# 📱 Panduan Lengkap: Build APK dari GitHub (Bahasa Indonesia)

## 🎯 Ringkasan Singkat

Anda akan:
1. Login ke Expo → Generate token
2. Copy token → Paste ke GitHub
3. Push code → APK build otomatis

**Waktu:** ~10 menit setup, ~20 menit build

---

## 📋 LANGKAH 1: Login ke Expo

### Di Terminal/CMD Laptop:

```bash
eas login
```

**Masukkan:**
- Email/username Expo Anda
- Password Expo Anda

**Jika berhasil, muncul:**
```
✔ Logged in as napoleones1
```

---

## 🔑 LANGKAH 2: Generate Token di Website Expo

### A. Buka Browser

Buka link ini di browser:
```
https://expo.dev/accounts/napoleones1/settings/access-tokens
```

### B. Create Token

1. **Click tombol "Create Token"** (tombol biru)

2. **Isi form:**
   ```
   Token name: GITHUB_ACTIONS
   Expiration: Never
   ```

3. **Click "Create"**

4. **Token akan muncul** (hanya sekali!):
   ```
   expo_ABC123XYZ789...
   ```

5. **COPY token ini!** (Click icon copy atau Ctrl+C)

### C. Simpan Token

**PENTING:** Token hanya muncul sekali!
- Copy ke notepad dulu
- Atau langsung paste ke GitHub (langkah berikutnya)

---

## 🔐 LANGKAH 3: Add Token ke GitHub

### A. Buka GitHub Settings

Buka link ini di browser:
```
https://github.com/napoleones1/securechat/settings/secrets/actions
```

**Atau manual:**
1. Buka: https://github.com/napoleones1/securechat
2. Click tab "Settings"
3. Sidebar kiri → "Secrets and variables" → "Actions"

### B. Add Secret

1. **Click "New repository secret"** (tombol hijau)

2. **Isi form:**
   ```
   Name: EXPO_TOKEN
   Secret: [paste token dari Expo tadi]
   ```

3. **Click "Add secret"**

4. **Selesai!** Anda akan melihat `EXPO_TOKEN` di list

---

## ✅ LANGKAH 4: Test Build APK

### Cara A: Manual Trigger (Untuk Test)

1. **Buka GitHub Actions:**
   ```
   https://github.com/napoleones1/securechat/actions
   ```

2. **Click "Build Android APK"** (di sidebar kiri)

3. **Click "Run workflow"** (tombol biru di kanan)

4. **Click "Run workflow"** lagi (di dropdown)

5. **Wait ~20 menit** (build di cloud)

6. **Check status:**
   - ✅ Hijau = Berhasil
   - ❌ Merah = Gagal (check logs)

7. **Download APK:**
   - Buka: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds
   - Click build terbaru
   - Download APK

### Cara B: Otomatis (Push Code)

Setiap kali Anda push code ke GitHub, APK akan di-build otomatis:

```bash
# 1. Update code mobile
cd SecureChatMinimal
# Edit files...

# 2. Commit & push
git add .
git commit -m "Update mobile app"
git push

# 3. APK akan di-build otomatis!
# Check progress: https://github.com/napoleones1/securechat/actions
```

---

## 📱 LANGKAH 5: Install APK di HP

1. **Download APK** dari EAS dashboard

2. **Transfer ke HP:**
   - Via USB
   - Via WhatsApp
   - Via Google Drive
   - Atau download langsung di HP

3. **Install:**
   - Buka file APK di HP
   - Allow "Install from unknown sources" (jika diminta)
   - Click "Install"
   - Click "Open"

4. **Test app!**

---

## 🔄 Update APK (Untuk Ke Depannya)

Setiap kali mau update app:

```bash
# 1. Update code
cd SecureChatMinimal
# Edit files...

# 2. Update version (optional)
# Edit SecureChatMinimal/app.json:
# "version": "1.0.1" → "1.0.2"

# 3. Commit & push
git add .
git commit -m "Update: [deskripsi update]"
git push

# 4. Wait ~20 menit
# 5. Download APK baru dari EAS dashboard
# 6. Install di HP (replace APK lama)
```

---

## 📊 Monitoring Build

### Check Build Progress:

**GitHub Actions:**
```
https://github.com/napoleones1/securechat/actions
```
- Lihat status build (running/success/failed)
- Lihat logs jika ada error

**EAS Dashboard:**
```
https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds
```
- Lihat semua builds
- Download APK
- Lihat build details

---

## 🐛 Troubleshooting

### ❌ Error: "EXPO_TOKEN not found"

**Solusi:**
1. Check nama secret harus: `EXPO_TOKEN` (huruf besar semua)
2. Check token sudah di-paste dengan benar
3. Coba delete secret dan add lagi

### ❌ Error: "Build failed"

**Solusi:**
1. Buka build logs di GitHub Actions
2. Baca error message
3. Fix error di code
4. Push lagi

### ❌ APK tidak bisa install

**Solusi:**
1. Enable "Install from unknown sources" di HP
2. Check APK tidak corrupt (download ulang)
3. Uninstall APK lama dulu

### ⏰ Build terlalu lama

**Normal:**
- Build biasanya 15-30 menit
- Free tier ada queue
- Sabar menunggu

**Jika lebih dari 1 jam:**
- Check build logs
- Mungkin ada error
- Cancel dan build ulang

---

## 💡 Tips & Tricks

### ✅ Best Practices:

1. **Update version** setiap build baru:
   ```json
   // SecureChatMinimal/app.json
   {
     "expo": {
       "version": "1.0.1" // Increment setiap update
     }
   }
   ```

2. **Commit message yang jelas:**
   ```bash
   git commit -m "Add: fitur baru X"
   git commit -m "Fix: bug di login"
   git commit -m "Update: UI chat screen"
   ```

3. **Test di local dulu** sebelum build:
   ```bash
   cd SecureChatMinimal
   npx expo start
   # Test di Expo Go
   ```

4. **Build hanya saat perlu:**
   - Tidak perlu build setiap commit
   - Build saat ada update signifikan
   - Atau build untuk release

### 📦 Distribute APK:

**Cara 1: Direct Link**
- Share link EAS Build ke teman
- Mereka download langsung

**Cara 2: GitHub Releases**
- Upload APK ke GitHub Releases
- Share link release

**Cara 3: Google Drive**
- Upload APK ke Google Drive
- Share link

**Cara 4: WhatsApp**
- Send APK file via WhatsApp
- Teman download dan install

---

## 📞 Butuh Bantuan?

**Dokumentasi:**
- [SETUP_EXPO_TOKEN.md](SETUP_EXPO_TOKEN.md) - Detail setup token
- [BUILD_APK_GITHUB.md](BUILD_APK_GITHUB.md) - Full documentation
- [QUICK_BUILD_APK.md](QUICK_BUILD_APK.md) - Quick reference

**Contact:**
- Email: muhamadhaikal.me@gmail.com
- GitHub Issues: https://github.com/napoleones1/securechat/issues

---

## 🎉 Summary

**Setup (Sekali saja):**
1. ✅ Login Expo: `eas login`
2. ✅ Generate token: https://expo.dev/accounts/napoleones1/settings/access-tokens
3. ✅ Add secret: https://github.com/napoleones1/securechat/settings/secrets/actions

**Build APK:**
1. ✅ Push code: `git push`
2. ✅ Wait 20 menit
3. ✅ Download: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds

**Install:**
1. ✅ Transfer APK ke HP
2. ✅ Install
3. ✅ Test!

---

**Selamat mencoba! Semoga berhasil! 🚀**
