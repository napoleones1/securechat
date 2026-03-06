const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @route   POST /api/chats
// @desc    Create or get 1-on-1 chat
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', '-password')
      .populate('lastMessage');

    if (chat) {
      return res.json({ success: true, data: chat });
    }

    // Create new chat
    chat = await Chat.create({
      isGroupChat: false,
      participants: [req.user._id, userId]
    });

    chat = await Chat.findById(chat._id).populate('participants', '-password');

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/chats
// @desc    Get all chats for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: '-password'
        }
      })
      .populate('admin', '-password')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/chats/group
// @desc    Create group chat
// @access  Private
router.post('/group', protect, async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group name and at least 1 participant required' 
      });
    }

    // Add creator to participants
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];

    const chat = await Chat.create({
      name,
      isGroupChat: true,
      participants: allParticipants,
      admin: req.user._id,
      admins: [req.user._id] // Creator is automatically admin
    });

    // Create system message for group creation
    const systemMessage = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: `${req.user.name || req.user.username} created the group`,
      messageType: 'system',
      status: 'sent'
    });

    // Update last message
    chat.lastMessage = systemMessage._id;
    await chat.save();

    const fullChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password');

    res.status(201).json({ success: true, data: fullChat, systemMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chats/group/:id
// @desc    Update group chat
// @access  Private
router.put('/group/:id', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (name) chat.name = name;
    if (avatar) chat.avatar = avatar;

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chats/group/:id/add
// @desc    Add user to group
// @access  Private
router.put('/group/:id/add', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (chat.participants.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already in group' });
    }

    // Get user info for system message
    const User = require('../models/User');
    const addedUser = await User.findById(userId);

    chat.participants.push(userId);
    await chat.save();

    // Create system message
    const systemMessage = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: `${addedUser.name || addedUser.username} joined the group`,
      messageType: 'system',
      status: 'sent'
    });

    // Update last message
    chat.lastMessage = systemMessage._id;
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password');

    res.json({ success: true, data: updatedChat, systemMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chats/group/:id/remove
// @desc    Remove user from group
// @access  Private
router.put('/group/:id/remove', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    chat.participants = chat.participants.filter(p => p.toString() !== userId);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chats/group/:id/info
// @desc    Update group info (name, bio)
// @access  Private (Admin only)
router.put('/group/:id/info', protect, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = chat.admins && chat.admins.some(adminId => adminId.toString() === req.user._id.toString());
    if (!isAdmin && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admins can update group info' });
    }

    if (name) chat.name = name;
    if (bio !== undefined) chat.bio = bio;
    if (avatar !== undefined) chat.avatar = avatar;

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chats/group/:id/promote
// @desc    Promote member to admin
// @access  Private (Admin only)
router.put('/group/:id/promote', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = chat.admins && chat.admins.some(adminId => adminId.toString() === req.user._id.toString());
    if (!isAdmin && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admins can promote members' });
    }

    // Check if user is already admin
    if (chat.admins && chat.admins.some(adminId => adminId.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    // Add to admins array
    if (!chat.admins) chat.admins = [];
    chat.admins.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chats/group/:id/demote
// @desc    Demote admin to member
// @access  Private (Admin only)
router.put('/group/:id/demote', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = chat.admins && chat.admins.some(adminId => adminId.toString() === req.user._id.toString());
    if (!isAdmin && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admins can demote members' });
    }

    // Cannot demote the creator
    if (chat.admin.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot demote group creator' });
    }

    // Remove from admins array
    chat.admins = chat.admins.filter(adminId => adminId.toString() !== userId);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password');

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/chats/group/:id/member/:userId
// @desc    Remove member from group
// @access  Private (Admin only)
router.delete('/group/:id/member/:userId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = chat.admins && chat.admins.some(adminId => adminId.toString() === req.user._id.toString());
    if (!isAdmin && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admins can remove members' });
    }

    // Cannot remove the creator
    if (chat.admin.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove group creator' });
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

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/chats/group/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/group/:id/leave', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is in the group
    if (!chat.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are not in this group' });
    }

    // Create system message for leave (only if not super admin)
    let systemMessage = null;
    if (req.user.role !== 'admin') {
      systemMessage = await Message.create({
        chat: chat._id,
        sender: req.user._id,
        content: `${req.user.name || req.user.username} left the group`,
        messageType: 'system',
        status: 'sent'
      });
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(p => p.toString() !== req.user._id.toString());
    
    // Remove user from admins if they are admin
    if (chat.admins) {
      chat.admins = chat.admins.filter(a => a.toString() !== req.user._id.toString());
    }

    // Check if user is the creator
    const isCreator = chat.admin.toString() === req.user._id.toString();

    // If no participants left, delete the group
    if (chat.participants.length === 0) {
      await Chat.findByIdAndDelete(chat._id);
      return res.json({ 
        success: true, 
        message: 'Group deleted (no members left)',
        deleted: true
      });
    }

    // If creator leaves, assign new creator
    if (isCreator) {
      // First try to assign from existing admins
      if (chat.admins && chat.admins.length > 0) {
        chat.admin = chat.admins[0];
      } else {
        // Otherwise assign first remaining participant
        chat.admin = chat.participants[0];
        // Make them admin too
        if (!chat.admins) chat.admins = [];
        chat.admins.push(chat.participants[0]);
      }
    }

    // If no admins left, assign first participant as admin
    if (!chat.admins || chat.admins.length === 0) {
      if (!chat.admins) chat.admins = [];
      chat.admins.push(chat.participants[0]);
      // Also make them the creator if creator left
      if (isCreator) {
        chat.admin = chat.participants[0];
      }
    }

    // Update last message to system message (only if system message was created)
    if (systemMessage) {
      chat.lastMessage = systemMessage._id;
    }
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate('admins', '-password');

    res.json({ 
      success: true, 
      message: 'Left group successfully',
      data: updatedChat,
      systemMessage: systemMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
