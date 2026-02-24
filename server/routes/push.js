const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getVapidPublicKey, subscribe, unsubscribe } = require('../controllers/pushController');

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);

module.exports = router;
