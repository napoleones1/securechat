# SecureChat - Testing Guide

Panduan lengkap untuk testing aplikasi SecureChat.

## 🧪 Testing Strategy

### 1. Manual Testing
- Functional testing
- UI/UX testing
- Cross-platform testing
- Performance testing

### 2. Automated Testing
- Unit tests
- Integration tests
- E2E tests
- API tests

## 📋 Manual Testing Checklist

### Backend API Testing

#### Authentication
- [ ] Register dengan data valid
- [ ] Register dengan email duplicate
- [ ] Register dengan password < 6 karakter
- [ ] Login dengan credentials benar
- [ ] Login dengan credentials salah
- [ ] Access protected route tanpa token
- [ ] Access protected route dengan token invalid
- [ ] Logout berhasil

#### Users
- [ ] Search users dengan query
- [ ] Get user by ID
- [ ] Update profile
- [ ] Update profile dengan username duplicate

#### Chats
- [ ] Create 1-on-1 chat
- [ ] Create 1-on-1 chat yang sudah ada (return existing)
- [ ] Get all user chats
- [ ] Create group chat
- [ ] Update group chat (admin only)
- [ ] Add participant to group
- [ ] Remove participant from group
- [ ] Non-admin try to update group (should fail)

#### Messages
- [ ] Get messages for chat
- [ ] Send text message
- [ ] Send message dengan file
- [ ] Mark message as read
- [ ] Delete message
- [ ] Pagination works correctly

#### File Upload
- [ ] Upload image (jpg, png)
- [ ] Upload document (pdf, doc)
- [ ] Upload file > 10MB (should fail)
- [ ] Upload invalid file type (should fail)

### Mobile App Testing

#### Authentication Flow
- [ ] Register screen UI
- [ ] Register dengan data valid
- [ ] Register error handling
- [ ] Login screen UI
- [ ] Login dengan credentials benar
- [ ] Login error handling
- [ ] Auto-login on app restart
- [ ] Logout

#### Chat List
- [ ] Display all chats
- [ ] Show last message
- [ ] Show timestamp
- [ ] Real-time update when new message
- [ ] Pull to refresh
- [ ] Empty state when no chats

#### Chat Screen
- [ ] Display messages
- [ ] Send text message
- [ ] Receive message real-time
- [ ] Typing indicator
- [ ] Message timestamps
- [ ] Scroll to bottom
- [ ] Load more messages (pagination)
- [ ] Message bubbles styling

#### New Chat
- [ ] Search users
- [ ] Display search results
- [ ] Create chat on user select
- [ ] Navigate to chat

#### Profile
- [ ] Display user info
- [ ] Edit username
- [ ] Edit bio
- [ ] Save changes
- [ ] Cancel editing
- [ ] Logout

### Desktop App Testing

#### All features dari Mobile App
- [ ] Login/Register
- [ ] Chat list
- [ ] Chat screen
- [ ] New chat modal
- [ ] Real-time updates

#### Desktop Specific
- [ ] Window resize
- [ ] Minimize/Maximize
- [ ] Close app
- [ ] Reopen app (persistence)
- [ ] Keyboard shortcuts

### Real-time Features

#### Socket.io
- [ ] Connect on login
- [ ] Disconnect on logout
- [ ] Reconnect on connection loss
- [ ] Join chat room
- [ ] Leave chat room
- [ ] Receive message real-time
- [ ] Typing indicator works
- [ ] Online status updates
- [ ] Multiple devices sync

### Cross-Platform Testing

#### Mobile
- [ ] Android emulator
- [ ] Android real device
- [ ] iOS simulator (Mac only)
- [ ] iOS real device (Mac only)
- [ ] Different screen sizes
- [ ] Different Android versions
- [ ] Different iOS versions

#### Desktop
- [ ] Windows 10/11
- [ ] macOS
- [ ] Linux (Ubuntu)

### Performance Testing

- [ ] App startup time < 3s
- [ ] Message send latency < 500ms
- [ ] Scroll performance smooth
- [ ] Memory usage reasonable
- [ ] Battery usage acceptable (mobile)
- [ ] Network usage efficient

### Security Testing

- [ ] Password not visible in network
- [ ] Token stored securely
- [ ] API endpoints require auth
- [ ] File upload validation works
- [ ] XSS prevention
- [ ] SQL injection prevention (N/A for MongoDB)

## 🤖 Automated Testing

### Backend Unit Tests

Create `backend/tests/auth.test.js`:

```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
```

### Run Backend Tests

```bash
cd backend

# Install test dependencies
npm install --save-dev jest supertest

# Add to package.json
"scripts": {
  "test": "jest --watchAll --verbose"
}

# Run tests
npm test
```

### Mobile Component Tests

Create `mobile/src/screens/__tests__/LoginScreen.test.js`:

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

describe('LoginScreen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('shows error when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    const loginButton = getByText('Login');
    
    fireEvent.press(loginButton);
    
    // Should show alert or error message
  });
});
```

### Run Mobile Tests

```bash
cd mobile

# Install test dependencies
npm install --save-dev @testing-library/react-native

# Run tests
npm test
```

## 🔍 API Testing with Postman

### Setup

1. Import collection dari `postman_collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:5000
   - `token`: (will be set automatically)

### Test Scenarios

#### 1. Register & Login Flow

```
1. POST {{base_url}}/api/auth/register
   Body: {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   
2. POST {{base_url}}/api/auth/login
   Body: {
     "email": "test@example.com",
     "password": "password123"
   }
   Save token to environment
   
3. GET {{base_url}}/api/auth/me
   Headers: Authorization: Bearer {{token}}
```

#### 2. Chat Flow

```
1. Search users
   GET {{base_url}}/api/users?search=john
   
2. Create chat
   POST {{base_url}}/api/chats
   Body: { "userId": "user_id_here" }
   
3. Send message
   POST {{base_url}}/api/messages
   Body: {
     "chatId": "chat_id_here",
     "content": "Hello!",
     "messageType": "text"
   }
   
4. Get messages
   GET {{base_url}}/api/messages/{{chatId}}
```

## 📊 Load Testing

### Using Artillery

```bash
# Install Artillery
npm install -g artillery

# Create test file: load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Login and send message"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.token"
              as: "token"
      - post:
          url: "/api/messages"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            chatId: "chat_id"
            content: "Test message"

# Run test
artillery run load-test.yml
```

## 🐛 Debugging Tips

### Backend

```javascript
// Add debug logs
console.log('Request body:', req.body);
console.log('User:', req.user);

// Use debugger
debugger;

// Check MongoDB queries
mongoose.set('debug', true);
```

### Mobile

```javascript
// React Native Debugger
// Enable in app: Cmd+D (iOS) / Cmd+M (Android)

// Console logs
console.log('State:', state);
console.log('Props:', props);

// Network inspector
// Check in React Native Debugger
```

### Desktop

```javascript
// Open DevTools
mainWindow.webContents.openDevTools();

// Console logs
console.log('Data:', data);
```

## 📝 Test Reports

### Generate Coverage Report

```bash
# Backend
cd backend
npm test -- --coverage

# Mobile
cd mobile
npm test -- --coverage
```

### View Coverage

Open `coverage/lcov-report/index.html` in browser.

## ✅ Testing Best Practices

1. **Write tests first** (TDD)
2. **Test one thing at a time**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Clean up after tests**
6. **Test edge cases**
7. **Maintain test data**
8. **Run tests before commit**
9. **Automate testing in CI/CD**
10. **Keep tests fast**

## 🎯 Testing Goals

- **Unit Test Coverage**: > 70%
- **Integration Test Coverage**: > 50%
- **E2E Test Coverage**: Critical paths
- **Performance**: All APIs < 500ms
- **Uptime**: > 99.9%

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Artillery](https://artillery.io/)

---

**Happy Testing! 🧪**
