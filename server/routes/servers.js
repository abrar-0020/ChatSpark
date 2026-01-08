const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createServer,
  getServers,
  getServer,
  updateServer,
  deleteServer,
  joinServer,
  leaveServer,
  getInviteCode,
  updateMemberRole
} = require('../controllers/serverController');
const {
  createChannel,
  getChannels
} = require('../controllers/channelController');

// Server routes
router.route('/')
  .get(protect, getServers)
  .post(protect, createServer);

router.route('/:id')
  .get(protect, getServer)
  .put(protect, updateServer)
  .delete(protect, deleteServer);

router.post('/join/:inviteCode', protect, joinServer);
router.post('/:id/leave', protect, leaveServer);
router.get('/:id/invite', protect, getInviteCode);
router.put('/:id/members/:userId', protect, updateMemberRole);

// Channel routes within server
router.route('/:serverId/channels')
  .get(protect, getChannels)
  .post(protect, createChannel);

module.exports = router;
