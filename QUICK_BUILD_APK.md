# ⚡ Quick Guide: Build APK dari GitHub

## 🎯 3 Langkah Mudah

### 1️⃣ Setup Expo Token (Sekali saja)

**A. Generate Token:**
```bash
eas login
```
Lalu buka: https://expo.dev/accounts/napoleones1/settings/access-tokens
- Click "Create Token"
- Name: `GITHUB_ACTIONS`
- Copy token

**B. Add ke GitHub:**
1. Buka: https://github.com/napoleones1/securechat/settings/secrets/actions
2. Click "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: Paste token
5. Click "Add secret"

### 2️⃣ Trigger Build

**Cara A - Otomatis (Recommended):**
```bash
# Update code mobile
cd SecureChatMinimal
# Edit files...

# Commit & push
git add .
git commit -m "Update mobile app"
git push

# APK akan di-build otomatis!
```

**Cara B - Manual:**
1. Buka: https://github.com/napoleones1/securechat/actions
2. Click "Build Android APK"
3. Click "Run workflow"
4. Click "Run workflow" button

### 3️⃣ Download APK

Setelah build selesai (~20 menit):
1. Buka: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds
2. Click build terbaru
3. Download APK
4. Install di HP

---

## 📊 Check Build Status

- **GitHub Actions**: https://github.com/napoleones1/securechat/actions
- **EAS Dashboard**: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds

---

## 🔄 Update & Rebuild

```bash
# 1. Update code
cd SecureChatMinimal
# Edit files...

# 2. Push ke GitHub
git add .
git commit -m "Your message"
git push

# 3. APK akan di-build otomatis
# 4. Download dari EAS dashboard
```

---

## ⚠️ Troubleshooting

**Build gagal?**
- Check logs di GitHub Actions
- Check logs di EAS dashboard
- Pastikan `EXPO_TOKEN` sudah di-add

**Build lama?**
- Normal: 15-30 menit
- Free tier ada queue
- Upgrade untuk priority

---

## 💡 Tips

✅ Build otomatis saat push ke `main`
✅ Bisa trigger manual via GitHub UI
✅ Download APK dari EAS dashboard
✅ Share link APK ke teman

---

**That's it! Simple! 🚀**

Full documentation: [BUILD_APK_GITHUB.md](BUILD_APK_GITHUB.md)
