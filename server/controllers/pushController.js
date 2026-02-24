const webpush = require('web-push');
const { saveSubscription, removeSubscription } = require('../storage/pushSubscriptions');

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@chatspark.app',
    pub,
    priv
  );
  vapidConfigured = true;
  return true;
}

// GET /api/push/vapid-public-key
const getVapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// POST /api/push/subscribe
const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }
    saveSubscription(req.user._id.toString(), subscription);
    res.json({ message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ message: 'Failed to save subscription' });
  }
};

// POST /api/push/unsubscribe
const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'Endpoint required' });
    removeSubscription(req.user._id.toString(), endpoint);
    res.json({ message: 'Unsubscribed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unsubscribe' });
  }
};

module.exports = { getVapidPublicKey, subscribe, unsubscribe };
