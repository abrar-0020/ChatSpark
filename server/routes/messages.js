const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  deleteMessage,
  editMessage
} = require('../controllers/messageController');

router.route('/:id')
  .put(protect, editMessage)
  .delete(protect, deleteMessage);

module.exports = router;
