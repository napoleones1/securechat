# SecureChat - Deployment Guide

Panduan untuk deploy aplikasi SecureChat ke production.

## 🌐 Backend Deployment

### Option 1: Heroku (Recommended untuk pemula)

#### Prerequisites
- Akun Heroku
- Heroku CLI installed

#### Steps

```bash
# 1. Login ke Heroku
heroku login

# 2. Create app
cd backend
heroku create securechat-api

# 3. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 4. Set environment variables
heroku config:set JWT_SECRET=your_super_secret_key
heroku config:set NODE_ENV=production

# 5. Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# 6. Check logs
heroku logs --tail
```

### Option 2: DigitalOcean

#### Prerequisites
- DigitalOcean account
- Domain name (optional)

#### Steps

```bash
# 1. Create Droplet (Ubuntu 22.04)
# 2. SSH ke server
ssh root@your_server_ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 5. Install PM2
sudo npm install -g pm2

# 6. Clone repository
git clone https://github.com/your-username/securechat.git
cd securechat/backend

# 7. Install dependencies
npm install --production

# 8. Create .env file
nano .env
# Add your production environment variables

# 9. Start with PM2
pm2 start server.js --name securechat-api
pm2 save
pm2 startup

# 10. Setup Nginx (optional)
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/securechat

# Add this configuration:
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/securechat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 11. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

### Option 3: AWS EC2

Similar to DigitalOcean, but:
1. Create EC2 instance
2. Configure Security Groups (ports 80, 443, 22)
3. Follow DigitalOcean steps

### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/securechat
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
# Deploy
docker-compose up -d
```

## 📱 Mobile App Deployment

### Android

#### 1. Generate Signing Key

```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore securechat.keystore -alias securechat -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. Configure Gradle

Edit `android/gradle.properties`:
```properties
SECURECHAT_UPLOAD_STORE_FILE=securechat.keystore
SECURECHAT_UPLOAD_KEY_ALIAS=securechat
SECURECHAT_UPLOAD_STORE_PASSWORD=your_password
SECURECHAT_UPLOAD_KEY_PASSWORD=your_password
```

Edit `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(SECURECHAT_UPLOAD_STORE_FILE)
            storePassword SECURECHAT_UPLOAD_STORE_PASSWORD
            keyAlias SECURECHAT_UPLOAD_KEY_ALIAS
            keyPassword SECURECHAT_UPLOAD_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

#### 3. Build APK

```bash
cd mobile/android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

#### 4. Build AAB (for Play Store)

```bash
./gradlew bundleRelease
```

AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

#### 5. Upload to Google Play Store

1. Create developer account ($25 one-time fee)
2. Create app in Play Console
3. Upload AAB
4. Fill app details
5. Submit for review

### iOS

#### Prerequisites
- Mac with Xcode
- Apple Developer account ($99/year)

#### 1. Configure Xcode

```bash
cd mobile/ios
open SecureChat.xcworkspace
```

1. Select project in Xcode
2. Go to Signing & Capabilities
3. Select your team
4. Configure bundle identifier

#### 2. Archive

1. Product → Archive
2. Wait for archive to complete
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Follow wizard

#### 3. Upload to App Store

1. Open App Store Connect
2. Create new app
3. Fill app information
4. Upload build from Xcode
5. Submit for review

## 💻 Desktop App Deployment

### Build for All Platforms

```bash
cd desktop

# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Distribution

#### Option 1: GitHub Releases

```bash
# Create release on GitHub
# Upload built files (.exe, .dmg, .AppImage)
```

#### Option 2: Auto-update with electron-updater

```bash
npm install electron-updater

# Configure in main.js
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

#### Option 3: Microsoft Store / Mac App Store

Follow platform-specific guidelines.

## 🔒 Production Checklist

### Backend

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable logging
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure firewall
- [ ] Set up backups
- [ ] Use environment variables
- [ ] Minify responses
- [ ] Enable compression
- [ ] Set security headers

### Database

- [ ] Use MongoDB Atlas or managed service
- [ ] Enable authentication
- [ ] Set up backups
- [ ] Configure indexes
- [ ] Monitor performance
- [ ] Set connection limits

### Mobile

- [ ] Update API_URL to production
- [ ] Enable ProGuard (Android)
- [ ] Optimize images
- [ ] Remove console.logs
- [ ] Test on real devices
- [ ] Configure push notifications
- [ ] Set up crash reporting (Sentry)
- [ ] Add analytics (Firebase)

### Desktop

- [ ] Update API_URL to production
- [ ] Code signing
- [ ] Auto-update mechanism
- [ ] Crash reporting
- [ ] Remove dev tools

## 📊 Monitoring & Analytics

### Backend Monitoring

```bash
# PM2 monitoring
pm2 monit

# PM2 web dashboard
pm2 install pm2-server-monit
```

### Error Tracking

```bash
# Install Sentry
npm install @sentry/node

# Configure in server.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your_dsn' });
```

### Analytics

- Google Analytics
- Mixpanel
- Amplitude

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm install
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd securechat/backend
          git pull
          npm install
          pm2 restart securechat-api
```

## 💰 Cost Estimation

### Free Tier Options

- **Backend**: Heroku free tier / Railway
- **Database**: MongoDB Atlas free tier (512MB)
- **Storage**: Cloudflare R2 free tier (10GB)
- **Domain**: Freenom (free domains)

### Paid Options (Monthly)

- **Backend**: DigitalOcean Droplet ($5-10)
- **Database**: MongoDB Atlas ($9+)
- **Storage**: AWS S3 ($0.023/GB)
- **Domain**: Namecheap ($10/year)
- **SSL**: Let's Encrypt (Free)
- **CDN**: Cloudflare (Free)

**Total**: ~$15-30/month

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Check MongoDB connection
- Verify environment variables
- Check port availability

**Mobile app can't connect:**
- Update API_URL
- Check CORS settings
- Verify SSL certificate

**Socket.io not working:**
- Enable WebSocket in nginx
- Check firewall rules
- Verify Socket.io version compatibility

## 📚 Resources

- [Heroku Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [React Native Deployment](https://reactnative.dev/docs/signed-apk-android)
- [Electron Builder](https://www.electron.build/)

---

**Need help with deployment?** Feel free to ask!
