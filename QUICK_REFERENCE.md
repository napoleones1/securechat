# 🚀 SecureChat v0.1 Alpha - Quick Reference

Panduan cepat untuk menggunakan SecureChat.

---

## 📦 Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan MongoDB URI
npm start

# Desktop
cd desktop
npm install
npm start
```

---

## 🔑 Default Accounts

### Super Admin
```
Email: admin@securechat.com
Password: Admin@123456
```

### Test Users
Create your own via Register screen

---

## 💬 Basic Usage

### Register
1. Click "Register"
2. Fill: Email, Name, Username (@username), Password
3. Click "Register"

### Login
1. Enter email OR username
2. Enter password
3. Click "Login"

### Start Chat
1. Click "New Chat"
2. Search user by name/username/email
3. Click user to start chat
4. Type message and press Enter

### Send Files
1. Click 📎 (attach) button
2. Choose: Image, Video, Voice, or File
3. Select file
4. File will be sent automatically

### Voice Message
1. Click 📎 → Voice Message
2. Press and hold microphone button
3. Speak your message
4. Release to send (or slide left to cancel)

---

## 📞 Making Calls

### Voice Call
1. Open direct chat (not group)
2. Click 📞 button (top right)
3. Wait for answer
4. Use controls: Mute, End Call

### Video Call
1. Open direct chat (not group)
2. Click 📹 button (top right)
3. Wait for answer
4. Use controls: Mute, Toggle Video, End Call

### Minimize Call
1. During active call
2. Click "➖ Minimize" (top right)
3. Call moves to small window (bottom right)
4. Click "⬆ Expand" to return fullscreen

### View Call History
1. Click "Calls" tab in sidebar
2. View all incoming/outgoing calls
3. Click call to open chat

---

## 👥 Group Chat

### Create Group
1. Click "New Chat"
2. Switch to "New Group" tab
3. Enter group name
4. (Optional) Add bio and avatar
5. Select members (min 1)
6. Click "Create Group"

### Manage Group (Admin Only)
1. Click group name in chat header
2. Click "Group Info"
3. Edit name, bio, avatar
4. Manage members:
   - Promote to admin
   - Demote to member
   - Remove from group

### Leave Group
1. Open group chat
2. Click group name → "Group Info"
3. Scroll down
4. Click "Leave Group"
5. Confirm

---

## 👤 Profile Management

### Edit Profile
1. Click your name in sidebar
2. Edit: Name, Username, Bio
3. Upload avatar (optional)
4. Click "Save Changes"

### View Other Profile
1. Click user name in chat header
2. Or click user in chat list
3. View profile info

---

## 👨‍💼 Admin Features

### Access Admin Panel
1. Login as admin
2. Click "Admin Panel" in sidebar
3. Choose: Users or Groups tab

### Manage Users
1. Admin Panel → Users tab
2. Actions:
   - Ban/Unban user
   - Warn user
   - Verify/Unverify user

### Manage Groups
1. Admin Panel → Groups tab
2. Actions:
   - View group info
   - Join group
   - Kick members

---

## ⌨️ Keyboard Shortcuts

### Chat
- `Enter` - Send message
- `Shift + Enter` - New line
- `Ctrl/Cmd + N` - New chat
- `Esc` - Close modal

### Call
- `M` - Toggle mute
- `V` - Toggle video (video calls)
- `E` - End call
- `Esc` - Minimize call

---

## 🎨 UI Elements

### Status Indicators
- 🟢 Green dot - Online
- ⚪ Gray dot - Offline
- 🔵 Blue ✓ - Verified user
- 🟠 Orange badge - Admin

### Message Status
- ✓ - Sent
- ✓✓ - Delivered
- ✓✓ (green) - Read

### Call Icons
- 📞 - Voice call
- 📹 - Video call
- 📤 - Outgoing call
- 📥 - Incoming call
- 📵 - Missed call
- 🚫 - Rejected call

---

## 🔧 Settings

### Change Avatar
1. Profile → Click avatar
2. Select image file
3. Avatar updates automatically

### Change Username
1. Profile → Edit username
2. Check availability (green ✓)
3. Save changes

### Notification Settings
- Currently using system notifications
- Custom settings coming in v0.2

---

## 🐛 Troubleshooting

### Can't Login
- Check email/username spelling
- Check password (case-sensitive)
- Check if account is banned

### Messages Not Sending
- Check internet connection
- Refresh app
- Check if chat still exists

### Call Not Connecting
- Check microphone/camera permissions
- Check internet connection
- Try voice call first
- May need TURN server (behind strict NAT)

### Video Not Showing
- Check camera permissions
- Check if camera is being used by another app
- Try restarting app

### Avatar Not Updating
- Clear browser cache
- Refresh app
- Try different image format

---

## 📱 File Limits

### Supported Formats
- **Images:** jpg, png, gif, webp
- **Videos:** mp4, webm, avi, mov
- **Audio:** webm (voice messages)
- **Documents:** pdf, doc, docx, xls, xlsx, txt, zip

### Size Limits
- **Max file size:** 50MB
- **Voice messages:** No limit (but keep it short!)

---

## 🔒 Security Tips

### Password
- Use strong password (min 8 characters)
- Mix uppercase, lowercase, numbers, symbols
- Don't share password

### Account Safety
- Don't share login credentials
- Logout from shared devices
- Report suspicious users

### Privacy
- Control who can see your profile
- Block unwanted users
- Report abuse to admin

---

## 💡 Tips & Tricks

### Messaging
- Use @ to mention username
- Send voice messages for quick replies
- Use groups for team collaboration

### Calls
- Use voice call to save bandwidth
- Minimize call to multitask
- Check call history for missed calls

### Groups
- Set clear group name and bio
- Assign multiple admins for backup
- Use system messages to track changes

### Admin
- Verify trusted users
- Warn before banning
- Monitor groups regularly

---

## 🆘 Getting Help

### Documentation
- [README.md](README.md) - Overview
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [FEATURES.md](FEATURES.md) - Feature details
- [VERSION_0.1_ALPHA.md](VERSION_0.1_ALPHA.md) - Feature breakdown

### Support
- Check documentation first
- Search GitHub issues
- Create new issue if needed
- Email: support@securechat.com

---

## 📊 System Requirements

### Backend
- Node.js 16+
- MongoDB Atlas account
- Internet connection

### Desktop
- Windows 10+, macOS 10.13+, or Linux
- 4GB RAM minimum
- 500MB disk space
- Microphone (for calls)
- Camera (for video calls)

---

## 🎯 Best Practices

### For Users
- Keep app updated
- Use strong passwords
- Report bugs
- Provide feedback

### For Admins
- Monitor user activity
- Respond to reports quickly
- Keep groups organized
- Backup data regularly

### For Developers
- Follow coding standards
- Write tests
- Document changes
- Review pull requests

---

## 📝 Quick Commands

### Chat Commands
```
/help - Show help (coming soon)
/clear - Clear chat (coming soon)
/leave - Leave group (coming soon)
```

### Admin Commands
```
/ban @username - Ban user (coming soon)
/unban @username - Unban user (coming soon)
/verify @username - Verify user (coming soon)
```

---

## 🔗 Useful Links

- **GitHub:** https://github.com/yourusername/securechat
- **Documentation:** See docs folder
- **Issues:** GitHub Issues
- **Roadmap:** [ROADMAP.md](ROADMAP.md)

---

## 📞 Contact

- **Email:** support@securechat.com
- **GitHub:** @yourusername
- **Twitter:** @securechat

---

**Version:** 0.1.0-alpha  
**Last Updated:** March 5, 2026  
**Status:** Alpha Testing

---

**Need more help?** Check [QUICK_START.md](QUICK_START.md) or create an issue on GitHub!
