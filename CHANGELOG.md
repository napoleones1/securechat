# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0-alpha] - 2026-03-05

### 🎉 Initial Alpha Release

This is the first alpha release of SecureChat with core messaging and calling features.

### ✅ Added

#### 🔐 Authentication & User Management
- User registration with email, name, username, and password
- Login with email OR username (@username format)
- JWT token authentication with session persistence
- Password hashing with bcrypt (10 rounds)
- Unique username system with @ prefix
- Real-time username availability checker
- Display name (name) separate from username
- User role system (user, admin)
- Super admin account (admin@securechat.com)
- Verified badge (blue ✓) for verified users
- Admin badge (orange) for admin users
- Ban/unban user functionality
- User warning system
- Ban check during login

#### 👤 Profile Management
- Profile editor modal
- Edit display name, username, bio
- Avatar upload with image files
- Avatar fallback with UI Avatars API (initials)
- Cache busting for avatar updates
- User info modal to view other profiles
- Badge rendering with CSS classes (CSP compliant)

#### 💬 Direct Chat (1-on-1)
- Real-time messaging with Socket.io
- Create new chat with user search
- Chat list with last message preview
- Unread message count
- Online/offline status indicator
- Last seen timestamp
- Typing indicators (real-time)
- Message timestamps
- Search users by name, username, or email

#### 📎 Message Types & File Sharing
- Text messages
- Image sharing (jpg, png, gif, webp)
- Video sharing (mp4, webm, avi, mov)
- Voice messages with press-and-hold recording
- File sharing (pdf, doc, docx, xls, xlsx, txt, zip)
- File size limit: 50MB
- File preview and download
- Attach button with dropdown menu (4 options)
- MediaRecorder API for voice recording
- WhatsApp-style recording interface
- Recording timer and waveform animation

#### ✓ Message Status System
- Sent status (✓) - message sent to server
- Delivered status (✓✓) - message delivered to recipient
- Read status (✓✓ green) - message read by recipient
- Status tracking with deliveredTo and readBy arrays
- Status indicator in message bubble and chat list
- Real-time status updates via Socket.io

#### 👥 Group Chat
- Create group with name, bio, avatar
- Select multiple members (minimum 1 + creator)
- Creator automatically becomes admin
- Group avatar upload
- Group Info modal with member list
- Edit group name, bio, avatar (admin only)
- Role badges: Creator, Admin, Member
- Promote member to admin (admin only)
- Demote admin to member (creator only)
- Remove member from group (admin only)
- Leave group functionality
- Auto-assign new admin/creator when creator leaves
- System messages for join/leave (except super admin)
- Group deletion when last member leaves
- All message types supported in groups

#### 👨‍💼 Admin Panel
- View all users list
- Ban/unban users
- Warn users (warning counter)
- Verify/unverify users
- User status display (online/offline/banned)
- View all groups
- Join any group (super admin privilege)
- View group members
- Kick members from group
- Super admin invisible in group member list
- No system messages for super admin join/leave
- Admin messages with special styling (orange border, gradient)
- Admin badge on all messages
- Full access to all chats and groups

#### 📞 Voice & Video Call (WebRTC)
- Voice call (audio only)
- Video call (audio + video)
- Call buttons in chat header (📞 voice, 📹 video)
- Direct chat only (no group calls)
- WebRTC with Google STUN servers (free)
- Peer-to-peer connection
- ICE candidate exchange
- Incoming call modal fullscreen
- Display call type (voice/video)
- Answer/Reject buttons
- Active call fullscreen (100vw x 100vh)
- Video call: remote video fullscreen + local video PiP
- Voice call: gradient background with avatar
- Call timer (MM:SS format)
- Mute/unmute microphone
- Toggle video on/off (video calls)
- End call button
- Minimize to small window
- Maximize from minimized window
- Minimized call window (300px, bottom right)
- Timer sync across all views
- Background blur effects
- Call history tab in sidebar
- Display all calls (incoming/outgoing)
- Call status icons (missed, rejected, answered)
- Call duration display
- Call type indicator (voice/video)
- Click call log to open chat
- Call status tracking (initiated, ringing, answered, ended, missed, rejected, failed)
- Start time and end time tracking
- Duration calculation (in seconds)

#### 🎨 UI/UX Features
- Modern, clean interface
- Dark theme support
- Responsive layout
- Smooth animations
- Modal dialogs
- Dropdown menus
- Toast notifications
- Loading states
- Sidebar with tabs (Chats, Calls)
- Chat list with search
- Empty state messages
- Back buttons
- Context menus (3-dot menus)
- Avatar with fallback
- Status indicators (online/offline)
- Badge system (verified, admin)
- Message bubbles (sent/received)
- File previews (images, videos)
- Icon buttons
- Gradient backgrounds

#### 🔧 Backend
- RESTful API with Express
- MongoDB Atlas cloud database
- Socket.io for real-time communication
- JWT authentication
- File upload with Multer
- CORS configuration
- Helmet security headers
- CSP (Content Security Policy)
- User model (auth, profile, role, status)
- Chat model (direct & group)
- Message model (types, status, files)
- Call model (type, status, duration)
- 30+ API endpoints
- 20+ Socket.io events
- File management (backend/uploads/)
- Static file serving
- File type validation
- File size limits
- Unique filename generation

#### 🔒 Security
- Password hashing (bcrypt)
- JWT token validation
- Socket authentication
- Authorization checks
- Input validation
- XSS protection (CSP)
- CORS configuration
- Secure file upload
- Role-based access control

#### 📱 Desktop App (Electron)
- Cross-platform support (Windows, Mac, Linux)
- Native window controls
- System tray integration
- Auto-launch on startup (optional)
- Notification support
- File system access for uploads
- Local storage for session

#### 📚 Documentation
- README.md with project overview
- QUICK_START.md for quick setup
- SETUP_GUIDE.md with detailed instructions
- FEATURES.md with feature documentation
- ARCHITECTURE.md with system design
- CONTRIBUTING.md for contributors
- DEPLOYMENT.md for deployment guide
- TESTING.md for testing guide
- PROJECT_SUMMARY.md with project summary
- VERSION_0.1_ALPHA.md with feature breakdown
- LICENSE file (MIT)

### 🐛 Fixed
- Badge rendering issue (HTML showing as raw text) - fixed with CSS classes
- Timer not starting for call receiver - fixed with immediate timer start
- Call buttons positioning - moved to right side of chat header
- Remote video not showing - fixed WebRTC peer connection setup
- Avatar cache not updating - fixed with timestamp cache busting
- Username validation - proper format checking and uniqueness
- CSP blocking inline styles - migrated to CSS classes

### 🔄 Changed
- Login now accepts email OR username
- Username format changed to @username (unique, lowercase)
- Display name (name) shown in UI instead of username
- Call UI changed to fullscreen with minimize option
- Message status system enhanced with deliveredTo/readBy tracking
- Admin messages now have special styling
- Super admin invisible in groups

### 🚫 Removed
- Mobile app (React Native) - deferred to future version

### 📝 Notes
- This is an alpha release for testing and feedback
- Some features may have bugs or limitations
- Mobile app development deferred to v0.2
- TURN server support planned for future release
- Push notifications planned for future release
- End-to-end encryption planned for future release

### 🎯 Known Limitations
- No message editing/deletion yet
- No message reactions yet
- No file encryption yet
- No push notifications yet
- No TURN server (may have connectivity issues behind strict NAT)
- Desktop app only (no mobile yet)

---

## [Unreleased] - Future Versions

### Planned for v0.2 Beta
- Message editing and deletion
- Message reactions (emoji)
- File encryption
- Message forwarding
- Media gallery
- Message search
- TURN server integration
- Push notifications for missed calls
- Mobile app (React Native)

### Planned for v0.3
- End-to-end encryption
- Stories/Status feature
- Message scheduling
- Advanced group features (polls, announcements)
- Bot framework
- Webhooks
- API for third-party integrations

### Planned for v1.0 (Stable)
- Multi-tenancy support
- SSO integration
- Compliance features
- Advanced analytics
- Custom branding
- Enterprise features

---

## Version History

- **0.1.0-alpha** (2026-03-05) - Initial alpha release with core features
- **0.0.1** (2026-03-01) - Project setup and architecture

## Notes

- All dates are in YYYY-MM-DD format
- Breaking changes will be clearly marked
- Security updates will be prioritized
- Feature requests can be submitted via GitHub issues
- Alpha releases are for testing purposes only

---

**Current Version:** 0.1.0-alpha  
**Status:** Alpha Testing  
**Next Release:** 0.2.0-beta (planned Q2 2026)
