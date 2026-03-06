# 🚀 Push ke GitHub & Deploy

## 📋 Status Saat Ini

✅ Git repository sudah di-init
✅ All files sudah di-commit
✅ Siap untuk push ke GitHub

## 🔧 Step-by-Step Push ke GitHub

### Step 1: Buat Repository di GitHub

1. Buka https://github.com
2. Click "New repository"
3. Nama repository: `securechat` (atau nama lain)
4. Description: "Real-time messaging app with desktop and mobile versions"
5. **JANGAN** centang "Initialize with README" (sudah ada)
6. Click "Create repository"

### Step 2: Add Remote & Push

Repository GitHub Anda sudah dibuat di:
**https://github.com/napoleones1/securechat**

Code sudah di-push! ✅

Untuk update di masa depan:

```bash
git add .
git commit -m "Your commit message"
git push
```

### Step 3: Verify

Buka https://github.com/YOUR_USERNAME/securechat untuk melihat code Anda!

---

## 🌐 Deploy Backend ke Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy Backend

```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **securechat-backend**
- Directory? **./backend**
- Override settings? **N**

### Step 4: Set Environment Variables

Di Vercel dashboard:
1. Go to project settings
2. Environment Variables
3. Add:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Your JWT secret
   - `PORT`: 5000

### Step 5: Redeploy

```bash
vercel --prod
```

Copy the production URL (e.g., `https://securechat-backend.vercel.app`)

---

## 📱 Update Mobile App dengan Backend URL Baru

### Step 1: Update API Config

Edit `SecureChatMinimal/src/config/api.js`:

```javascript
export const API_URL = 'https://securechat-backend.vercel.app/api';
export const SOCKET_URL = 'https://securechat-backend.vercel.app';
```

### Step 2: Commit & Push

```bash
git add .
git commit -m "Update API URL to Vercel backend"
git push
```

### Step 3: Build APK Baru

```bash
cd SecureChatMinimal
eas build --platform android --profile preview
```

Download APK dari link yang diberikan.

---

## 🖥️ Deploy Desktop ke Vercel (Web Version)

Desktop app bisa di-deploy sebagai web app:

### Step 1: Update Desktop Config

Edit `desktop/src/config/api.js`:

```javascript
export const API_URL = 'https://securechat-backend.vercel.app/api';
export const SOCKET_URL = 'https://securechat-backend.vercel.app';
```

### Step 2: Create vercel.json

Create `desktop/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "standalone.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/standalone.html"
    }
  ]
}
```

### Step 3: Deploy

```bash
cd desktop
vercel --prod
```

Copy the URL (e.g., `https://securechat-desktop.vercel.app`)

---

## 📊 Summary URLs

Setelah deploy, Anda akan punya:

1. **GitHub Repository**: `https://github.com/napoleones1/securechat` ✅
2. **Backend API**: `https://securechat-backend.vercel.app` (akan dibuat)
3. **Desktop Web**: `https://securechat-desktop.vercel.app` (akan dibuat)
4. **Mobile APK**: Download dari EAS Build (akan dibuat)

---

## 🔄 Workflow untuk Update

### Update Code:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push
```

### Update Backend:

```bash
cd backend
vercel --prod
```

### Update Desktop:

```bash
cd desktop
vercel --prod
```

### Update Mobile:

```bash
cd SecureChatMinimal
eas build --platform android --profile preview
```

---

## 🎯 Next Steps

1. ✅ Push ke GitHub
2. ✅ Deploy backend ke Vercel
3. ✅ Update mobile API URL
4. ✅ Build APK baru
5. ✅ Deploy desktop ke Vercel (optional)
6. ✅ Test semua fitur
7. ✅ Share dengan teman!

---

## 📝 Notes

- Backend Vercel URL akan permanent (tidak berubah seperti ngrok)
- Mobile app bisa diakses dari mana saja
- Desktop web version bisa dibuka di browser
- Semua menggunakan database MongoDB Atlas yang sama

---

## ❓ Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/securechat.git
```

### Error: "failed to push"
```bash
git pull origin main --rebase
git push -u origin main
```

### Vercel deployment failed
- Check environment variables
- Check build logs
- Verify MongoDB connection string

---

Selamat! Project Anda siap di-deploy! 🎉
