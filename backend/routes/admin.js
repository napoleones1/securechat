const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban a user
// @access  Private/Admin
router.put('/users/:id/ban', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot ban another admin
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot ban admin users' });
    }

    user.isBanned = true;
    user.banReason = reason || 'No reason provided';
    await user.save();

    res.json({ 
      success: true, 
      message: 'User banned successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/unban
// @desc    Unban a user
// @access  Private/Admin
router.put('/users/:id/unban', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = '';
    await user.save();

    res.json({ 
      success: true, 
      message: 'User unbanned successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/users/:id/warn
// @desc    Warn a user
// @access  Private/Admin
router.post('/users/:id/warn', protect, adminOnly, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!message) {
      return res.status(400).json({ success: false, message: 'Warning message is required' });
    }

    user.warnings.push({
      message,
      by: req.user._id,
      date: new Date()
    });
    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('warnings.by', 'username');

    res.json({ 
      success: true, 
      message: 'Warning added successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify a user (blue checkmark)
// @access  Private/Admin
router.put('/users/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ 
      success: true, 
      message: 'User verified successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/unverify
// @desc    Remove verification from a user
// @access  Private/Admin
router.put('/users/:id/unverify', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = false;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Verification removed successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id/warnings/:warningId
// @desc    Remove a warning from user
// @access  Private/Admin
router.delete('/users/:id/warnings/:warningId', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.warnings = user.warnings.filter(w => w._id.toString() !== req.params.warningId);
    await user.save();

    res.json({ 
      success: true, 
      message: 'Warning removed successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


// @route   GET /api/admin/groups
// @desc    Get all groups (admin only)
// @access  Private/Admin
router.get('/groups', protect, adminOnly, async (req, res) => {
  try {
    const Chat = require('../models/Chat');
    const groups = await Chat.find({ isGroupChat: true })
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: '-password'
        }
      })
      .sort({ updatedAt: -1 });

    res.json({ 
      success: true, 
      data: groups,
      count: groups.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/groups/:groupId/members/:userId
// @desc    Kick member from any group (admin only)
// @access  Private/Admin
router.delete('/groups/:groupId/members/:userId', protect, adminOnly, async (req, res) => {
  try {
    const Chat = require('../models/Chat');
    const chat = await Chat.findById(req.params.groupId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Remove from participants and admins
    chat.participants = chat.participants.filter(p => p.toString() !== req.params.userId);
    if (chat.admins) {
      chat.admins = chat.admins.filter(a => a.toString() !== req.params.userId);
    }
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password');

    res.json({ 
      success: true, 
      message: 'Member kicked successfully',
      data: updatedChat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/groups/:groupId/join
// @desc    Admin join any group
// @access  Private/Admin
router.post('/groups/:groupId/join', protect, adminOnly, async (req, res) => {
  try {
    const Chat = require('../models/Chat');
    const chat = await Chat.findById(req.params.groupId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Add admin to participants if not already
    if (!chat.participants.includes(req.user._id)) {
      chat.participants.push(req.user._id);
      await chat.save();
      
      // Note: No system message for super admin joining
    }

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password');

    res.json({ 
      success: true, 
      message: 'Joined group successfully',
      data: updatedChat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// @route   GET /api/admin/groups/:groupId
// @desc    Get single group info (admin only)
// @access  Private/Admin
router.get('/groups/:groupId', protect, adminOnly, async (req, res) => {
  try {
    const Chat = require('../models/Chat');
    const group = await Chat.findById(req.params.groupId)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: '-password'
        }
      });

    if (!group || !group.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    res.json({ 
      success: true, 
      data: group
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
