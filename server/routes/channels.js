const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getChannel,
  updateChannel,
  deleteChannel
} = require('../controllers/channelController');
const {
  getMessages,
  createMessage
} = require('../controllers/messageController');

// Channel routes
router.route('/:id')
  .get(protect, getChannel)
  .put(protect, updateChannel)
  .delete(protect, deleteChannel);

// Message routes within channel
router.route('/:channelId/messages')
  .get(protect, getMessages)
  .post(protect, createMessage);

module.exports = router;
