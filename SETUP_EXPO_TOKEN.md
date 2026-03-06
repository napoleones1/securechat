# 🔑 Cara Setup Expo Token untuk GitHub Actions

## 📋 Overview

Anda perlu 2 hal:
1. **Expo Token** - Dari website Expo
2. **GitHub Secret** - Simpan token di GitHub

---

## 🎯 STEP 1: Generate Expo Token

### A. Login ke Expo (Di Terminal/CMD)

Buka terminal/CMD di laptop, lalu ketik:

```bash
eas login
```

**Akan muncul:**
```
? Email or username: 
```

Masukkan email/username Expo Anda (yang Anda pakai saat build APK sebelumnya).

**Lalu muncul:**
```
? Password: 
```

Masukkan password Expo Anda.

**Jika berhasil:**
```
✔ Logged in as napoleones1
```

### B. Buka Website Expo

1. Buka browser
2. Buka link ini: **https://expo.dev/accounts/napoleones1/settings/access-tokens**
3. Anda akan melihat halaman "Access Tokens"

### C. Create Token

Di halaman Access Tokens:

1. **Click tombol "Create Token"** (tombol biru di kanan atas)

2. **Akan muncul form:**
   - **Token name**: Ketik `GITHUB_ACTIONS`
   - **Expiration**: Pilih "Never" (tidak expired)
   - **Permissions**: Biarkan default (All)

3. **Click "Create"**

4. **PENTING!** Token akan muncul **HANYA SEKALI**:
   ```
   expo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
5. **COPY token ini!** (Click icon copy atau select all + Ctrl+C)
   - Token ini panjang, seperti: `expo_ABC123...xyz789`
   - Simpan di notepad dulu kalau perlu

---

## 🎯 STEP 2: Add Token ke GitHub

### A. Buka GitHub Repository

1. Buka browser
2. Buka: **https://github.com/napoleones1/securechat**
3. Anda akan melihat repository Anda

### B. Masuk ke Settings

1. Click tab **"Settings"** (di menu atas, paling kanan)
2. Jika tidak ada tab Settings, berarti Anda bukan owner repository

### C. Masuk ke Secrets

Di sidebar kiri:
1. Scroll ke bawah
2. Cari **"Secrets and variables"**
3. Click **"Secrets and variables"**
4. Click **"Actions"**

### D. Add Secret

Di halaman Secrets:

1. **Click tombol "New repository secret"** (tombol hijau)

2. **Akan muncul form:**
   - **Name**: Ketik `EXPO_TOKEN` (harus PERSIS seperti ini, huruf besar semua)
   - **Secret**: Paste token yang Anda copy dari Expo tadi
     ```
     expo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

3. **Click "Add secret"**

4. **Selesai!** Anda akan melihat `EXPO_TOKEN` di list secrets

---

## ✅ Verifikasi Setup

### Check 1: Expo Token
- Buka: https://expo.dev/accounts/napoleones1/settings/access-tokens
- Anda harus melihat token `GITHUB_ACTIONS` di list

### Check 2: GitHub Secret
- Buka: https://github.com/napoleones1/securechat/settings/secrets/actions
- Anda harus melihat `EXPO_TOKEN` di list

---

## 🚀 Test Build APK

Sekarang test apakah setup berhasil:

### Cara 1: Manual Trigger (Recommended untuk test)

1. Buka: **https://github.com/napoleones1/securechat/actions**
2. Click **"Build Android APK"** (di sidebar kiri)
3. Click tombol **"Run workflow"** (tombol biru)
4. Click **"Run workflow"** lagi (di dropdown)
5. Wait ~20 menit
6. Jika berhasil, akan ada ✅ hijau
7. Download APK dari: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds

### Cara 2: Otomatis (Push code)

```bash
# Update code
cd SecureChatMinimal
# Edit file apapun...

# Commit & push
git add .
git commit -m "Test auto build"
git push

# APK akan di-build otomatis
# Check progress di: https://github.com/napoleones1/securechat/actions
```

---

## 🐛 Troubleshooting

### Error: "EXPO_TOKEN not found"

**Penyebab:** Token belum di-add atau nama salah

**Solusi:**
1. Check nama secret harus PERSIS: `EXPO_TOKEN` (huruf besar semua)
2. Check token sudah di-paste dengan benar
3. Coba delete secret dan add lagi

### Error: "Invalid token"

**Penyebab:** Token salah atau expired

**Solusi:**
1. Generate token baru di Expo
2. Update secret di GitHub dengan token baru

### Error: "Build failed"

**Penyebab:** Ada error di code atau config

**Solusi:**
1. Check build logs di GitHub Actions
2. Check build logs di EAS dashboard
3. Fix error dan push lagi

---

## 📊 Summary

**Yang Anda butuhkan:**
1. ✅ Expo account (sudah ada: napoleones1)
2. ✅ Expo token (generate di: https://expo.dev/accounts/napoleones1/settings/access-tokens)
3. ✅ GitHub secret (add di: https://github.com/napoleones1/securechat/settings/secrets/actions)

**Setelah setup:**
- Push code → APK build otomatis
- Atau trigger manual via GitHub Actions
- Download APK dari EAS dashboard

---

## 🎯 Quick Links

- **Generate Token**: https://expo.dev/accounts/napoleones1/settings/access-tokens
- **Add Secret**: https://github.com/napoleones1/securechat/settings/secrets/actions
- **GitHub Actions**: https://github.com/napoleones1/securechat/actions
- **Download APK**: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds

---

## 💡 Tips

- Token hanya muncul sekali saat dibuat, simpan baik-baik
- Jika lupa token, generate token baru
- Token tidak expired jika pilih "Never"
- Bisa create multiple tokens untuk different purposes

---

**Selamat mencoba! 🚀**

Jika masih bingung, email: muhamadhaikal.me@gmail.com
