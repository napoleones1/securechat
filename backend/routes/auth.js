const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 1, max: 50 }),
  body('username').trim().isLength({ min: 2, max: 30 }).matches(/^@[a-z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, username, email, password } = req.body;

    // Ensure username starts with @
    const formattedUsername = username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username: formattedUsername }] });
    if (userExists) {
      if (userExists.username === formattedUsername) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Create user
    const user = await User.create({ 
      name, 
      username: formattedUsername, 
      email, 
      password 
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (with email or username)
// @access  Public
router.post('/login', [
  body('email').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if input is email or username
    let user;
    if (email.includes('@') && email.includes('.')) {
      // Looks like email
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else {
      // Treat as username
      const formattedUsername = email.startsWith('@') ? email.toLowerCase() : `@${email.toLowerCase()}`;
      user = await User.findOne({ username: formattedUsername }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        success: false, 
        message: `Account banned${user.banReason ? ': ' + user.banReason : ''}` 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update status
    user.status = 'online';
    user.lastSeen = Date.now();
    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// @route   GET /api/auth/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', async (req, res) => {
  try {
    let { username } = req.params;
    
    // Ensure username starts with @
    username = username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`;
    
    const user = await User.findOne({ username });
    
    res.json({
      success: true,
      available: !user,
      username: username
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    req.user.status = 'offline';
    req.user.lastSeen = Date.now();
    req.user.socketId = null;
    await req.user.save();

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
