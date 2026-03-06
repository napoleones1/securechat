# 📱 Build APK Menggunakan GitHub Actions

## 🎯 Overview

Ada 2 cara build APK menggunakan GitHub:
1. **GitHub Actions + EAS Build** (Otomatis) - RECOMMENDED
2. **Manual EAS Build** (Manual trigger)

---

## 🚀 Cara 1: GitHub Actions + EAS Build (Otomatis)

APK akan di-build otomatis setiap kali Anda push code ke GitHub.

### Step 1: Setup Expo Token

1. **Login ke Expo**:
```bash
eas login
```

2. **Generate Access Token**:
   - Buka: https://expo.dev/accounts/napoleones1/settings/access-tokens
   - Click "Create Token"
   - Name: `GITHUB_ACTIONS`
   - Click "Create"
   - **Copy token** (hanya muncul sekali!)

### Step 2: Add Token ke GitHub Secrets

1. Buka repository: https://github.com/napoleones1/securechat
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste token dari Step 1
6. Click **Add secret**

### Step 3: Trigger Build

**Otomatis:**
- Setiap push ke branch `main` yang mengubah folder `SecureChatMinimal/`
- APK akan di-build otomatis

**Manual:**
1. Go to **Actions** tab di GitHub
2. Click **Build Android APK** workflow
3. Click **Run workflow**
4. Click **Run workflow** button

### Step 4: Download APK

1. Setelah build selesai, buka: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds
2. Click build terbaru
3. Download APK

---

## 🔧 Cara 2: Manual EAS Build (Tanpa GitHub Actions)

Build APK langsung dari laptop Anda.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login

```bash
eas login
```

### Step 3: Build APK

```bash
cd SecureChatMinimal
eas build --platform android --profile preview
```

### Step 4: Download APK

Setelah build selesai (~15-20 menit), download APK dari link yang diberikan.

---

## 📊 Build Profiles

File `SecureChatMinimal/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**Profiles:**
- `preview` - Build APK untuk testing (lebih cepat)
- `production` - Build AAB untuk Google Play Store

---

## 🎯 Workflow GitHub Actions

File `.github/workflows/build-apk.yml` sudah dibuat dengan fitur:

✅ Trigger otomatis saat push ke `main`
✅ Trigger manual via GitHub Actions UI
✅ Install dependencies otomatis
✅ Build APK dengan EAS
✅ Support untuk Expo SDK 51

---

## 📱 Cara Pakai APK

### Download APK:
1. Dari EAS Build: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds
2. Atau dari GitHub Actions artifacts (jika di-setup)

### Install APK:
1. Transfer APK ke HP Android
2. Buka file APK
3. Allow "Install from unknown sources" jika diminta
4. Install
5. Buka app SecureChat

---

## 🔄 Update APK

### Cara 1: Via GitHub (Otomatis)

```bash
# Update code
git add .
git commit -m "Update mobile app"
git push

# APK akan di-build otomatis
# Check progress di: https://github.com/napoleones1/securechat/actions
```

### Cara 2: Manual Build

```bash
cd SecureChatMinimal
eas build --platform android --profile preview
```

---

## 🐛 Troubleshooting

### Error: "EXPO_TOKEN not found"
- Pastikan sudah add secret `EXPO_TOKEN` di GitHub Settings
- Token harus valid dan tidak expired

### Error: "Build failed"
- Check build logs di EAS dashboard
- Pastikan `package.json` dan `app.json` valid
- Pastikan tidak ada syntax error di code

### Error: "Cannot find module"
- Delete `node_modules` dan `package-lock.json`
- Run `npm install` lagi
- Commit dan push

### Build terlalu lama
- EAS free tier ada queue
- Build biasanya 15-30 menit
- Upgrade ke paid plan untuk priority queue

---

## 📊 Build Status

Check build status di:
- **GitHub Actions**: https://github.com/napoleones1/securechat/actions
- **EAS Dashboard**: https://expo.dev/accounts/napoleones1/projects/SecureChatMinimal/builds

---

## 💡 Tips

### Build Lebih Cepat:
1. Use `--profile preview` untuk APK (lebih cepat dari AAB)
2. Upgrade ke EAS paid plan untuk priority queue
3. Build hanya saat perlu (tidak setiap commit)

### Distribute APK:
1. **Direct Download**: Share link EAS Build
2. **GitHub Releases**: Upload APK ke GitHub Releases
3. **Google Drive**: Upload dan share link
4. **Play Store**: Build dengan `--profile production`

### Version Management:
Update version di `SecureChatMinimal/app.json`:
```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

---

## 🎉 Summary

✅ GitHub Actions workflow sudah dibuat
✅ Otomatis build saat push ke main
✅ Manual trigger via GitHub UI
✅ Download APK dari EAS dashboard

**Next Steps:**
1. Add `EXPO_TOKEN` ke GitHub Secrets
2. Push code ke GitHub
3. Wait for build to complete
4. Download APK dari EAS dashboard

---

## 📞 Support

Jika ada masalah:
- Check GitHub Actions logs
- Check EAS Build logs
- Email: muhamadhaikal.me@gmail.com
- GitHub Issues: https://github.com/napoleones1/securechat/issues

---

**Happy Building! 🚀**
