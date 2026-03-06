const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const { protect } = require('../middleware/auth');

// @route   GET /api/calls/:chatId
// @desc    Get call history for a chat
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
  try {
    const calls = await Call.find({ chat: req.params.chatId })
      .populate('caller', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/calls/user/history
// @desc    Get all call history for current user
// @access  Private
router.get('/user/history', protect, async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [
        { caller: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate('caller', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .populate('chat', 'name isGroupChat')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/calls
// @desc    Create new call log
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { receiver, chat, type } = req.body;

    const call = await Call.create({
      caller: req.user._id,
      receiver,
      chat,
      type: type || 'voice',
      status: 'initiated'
    });

    const populatedCall = await Call.findById(call._id)
      .populate('caller', 'name username avatar')
      .populate('receiver', 'name username avatar');

    res.status(201).json({ success: true, data: populatedCall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/calls/:id
// @desc    Update call status
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, endTime } = req.body;
    
    const updateData = { status };
    if (endTime) {
      updateData.endTime = endTime;
    }

    const call = await Call.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('caller', 'name username avatar')
      .populate('receiver', 'name username avatar');

    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }

    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
