# SecureChat - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
├──────────────────┬──────────────────┬───────────────────┤
│  Mobile (React   │  Desktop         │   Web (Future)    │
│  Native)         │  (Electron)      │                   │
│  - iOS           │  - Windows       │                   │
│  - Android       │  - macOS         │                   │
│                  │  - Linux         │                   │
└──────────────────┴──────────────────┴───────────────────┘
                           │
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Server                        │
├─────────────────────────────────────────────────────────┤
│  Node.js + Express                                       │
│  ├─ REST API (HTTP)                                      │
│  ├─ Socket.io (WebSocket)                                │
│  ├─ JWT Authentication                                   │
│  ├─ File Upload (Multer)                                 │
│  └─ Middleware (Auth, Validation, Error Handling)        │
└─────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
├──────────────────┬──────────────────────────────────────┤
│  MongoDB         │  File Storage                         │
│  - Users         │  - Images                             │
│  - Chats         │  - Documents                          │
│  - Messages      │  - Audio/Video                        │
└──────────────────┴──────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS

### Mobile (React Native)
- **Framework**: React Native 0.73
- **Navigation**: React Navigation 6
- **State Management**: Context API
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Storage**: AsyncStorage
- **UI Components**: React Native Gifted Chat
- **Icons**: React Native Vector Icons

### Desktop (Electron)
- **Framework**: Electron 28
- **UI**: HTML/CSS/JavaScript
- **Storage**: Electron Store
- **HTTP Client**: Fetch API
- **WebSocket**: Socket.io-client

## Architecture Patterns

### 1. Client-Server Architecture
- Centralized backend server
- Multiple client types (mobile, desktop)
- RESTful API for CRUD operations
- WebSocket for real-time features

### 2. MVC Pattern (Backend)
```
Models (MongoDB Schema)
    ↓
Controllers (Route Handlers)
    ↓
Views (JSON Responses)
```

### 3. Component-Based (Frontend)
```
Screens/Pages
    ↓
Components
    ↓
Services (API, Socket)
    ↓
Context (State Management)
```

## Data Flow

### Authentication Flow
```
1. User enters credentials
2. Client sends POST /api/auth/login
3. Server validates credentials
4. Server generates JWT token
5. Client stores token
6. Client includes token in subsequent requests
7. Server validates token on each request
```

### Real-time Messaging Flow
```
1. User types message
2. Client emits 'message:send' via Socket.io
3. Server receives event
4. Server saves message to database
5. Server emits 'message:new' to chat participants
6. Clients receive and display message
```

### File Upload Flow
```
1. User selects file
2. Client uploads to POST /api/upload
3. Server validates file (type, size)
4. Server saves file to disk
5. Server returns file URL
6. Client sends message with file URL
7. Recipients can download file
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed),
  avatar: String (URL),
  status: String (online/offline/away),
  lastSeen: Date,
  bio: String,
  socketId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Collection
```javascript
{
  _id: ObjectId,
  name: String (for groups),
  isGroupChat: Boolean,
  participants: [ObjectId] (ref: User, indexed),
  admin: ObjectId (ref: User),
  lastMessage: ObjectId (ref: Message),
  avatar: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  chat: ObjectId (ref: Chat, indexed),
  sender: ObjectId (ref: User),
  content: String,
  messageType: String (text/image/file/audio/video),
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  readBy: [{
    user: ObjectId (ref: User),
    readAt: Date
  }],
  deletedFor: [ObjectId] (ref: User),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## API Design

### RESTful Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users?search=query` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile

#### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create 1-on-1 chat
- `POST /api/chats/group` - Create group chat
- `PUT /api/chats/group/:id` - Update group
- `PUT /api/chats/group/:id/add` - Add participant
- `PUT /api/chats/group/:id/remove` - Remove participant

#### Messages
- `GET /api/messages/:chatId?page=1&limit=50` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

#### Upload
- `POST /api/upload` - Upload file

### Socket.io Events

#### Client → Server
- `message:send` - Send new message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Mark message as read
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room

#### Server → Client
- `message:new` - New message received
- `typing:user` - User is typing
- `typing:stop` - User stopped typing
- `message:read` - Message was read
- `user:online` - User came online
- `user:offline` - User went offline
- `stats:online` - Online users count

## Security Measures

### Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcrypt (10 rounds)
- Token validation on protected routes
- User authorization checks

### Input Validation
- express-validator for request validation
- File type validation
- File size limits
- SQL injection prevention (MongoDB)
- XSS prevention

### Network Security
- CORS configuration
- Helmet for HTTP headers
- Rate limiting (planned)
- HTTPS in production
- WSS (WebSocket Secure) in production

### Data Security
- Password never returned in responses
- Soft delete for messages
- User-specific data filtering
- File access control

## Performance Optimization

### Database
- Indexed fields (username, email, chat participants)
- Compound indexes for queries
- Pagination for messages
- Lean queries where possible

### Caching
- User session caching
- Chat list caching (planned)
- Message caching (planned)

### File Handling
- File size limits
- Streaming for large files
- CDN for static assets (planned)

### Real-time
- Socket.io rooms for efficient broadcasting
- Connection pooling
- Heartbeat mechanism

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- JWT for distributed auth
- Socket.io with Redis adapter (planned)
- Load balancer ready

### Vertical Scaling
- Efficient queries
- Connection pooling
- Memory management
- Process clustering (planned)

### Database Scaling
- MongoDB sharding (future)
- Read replicas (future)
- Separate analytics DB (future)

## Deployment Architecture

### Development
```
Local Machine
├─ MongoDB (localhost:27017)
├─ Backend (localhost:5000)
├─ Mobile (Emulator/Device)
└─ Desktop (Electron)
```

### Production (Planned)
```
Cloud Infrastructure
├─ MongoDB Atlas (Managed)
├─ Backend (Docker + Kubernetes)
│  ├─ Load Balancer
│  ├─ API Servers (Multiple instances)
│  └─ Socket.io Servers (Redis adapter)
├─ File Storage (S3/CloudFlare R2)
├─ CDN (CloudFlare)
└─ Monitoring (Prometheus + Grafana)
```

## Future Enhancements

### Phase 2 - Advanced
- WebRTC for voice/video calls
- End-to-end encryption
- Push notifications (FCM/APNS)
- Message search with Elasticsearch
- Analytics dashboard
- Admin panel

### Phase 3 - Enterprise
- Multi-tenancy
- SSO integration
- Compliance features
- Advanced analytics
- Custom branding
- API for third-party integrations

## Development Workflow

### Git Workflow
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### CI/CD Pipeline (Planned)
```
1. Code Push
2. Automated Tests
3. Build
4. Deploy to Staging
5. Manual Approval
6. Deploy to Production
```

## Monitoring & Logging

### Logging Strategy
- Console logs (development)
- File logs (production)
- Error tracking (Sentry - planned)
- Access logs (Morgan)

### Metrics to Monitor
- API response times
- Socket connections
- Database queries
- Error rates
- User activity
- System resources

## Testing Strategy

### Backend
- Unit tests (Jest)
- Integration tests
- API tests (Supertest)
- Load tests (Artillery)

### Frontend
- Component tests (Jest)
- E2E tests (Detox for mobile)
- UI tests

### Manual Testing
- Cross-platform testing
- Real device testing
- Network condition testing
- Security testing
