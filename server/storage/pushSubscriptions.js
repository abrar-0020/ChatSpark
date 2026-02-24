const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'push_subscriptions.json');

const load = () => {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
};

const save = (data) => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};

const saveSubscription = (userId, subscription) => {
  const all = load();
  if (!all[userId]) all[userId] = [];
  // Avoid duplicates by endpoint
  const exists = all[userId].some(s => s.endpoint === subscription.endpoint);
  if (!exists) all[userId].push(subscription);
  save(all);
};

const removeSubscription = (userId, endpoint) => {
  const all = load();
  if (all[userId]) {
    all[userId] = all[userId].filter(s => s.endpoint !== endpoint);
    if (all[userId].length === 0) delete all[userId];
  }
  save(all);
};

const getSubscriptions = (userId) => {
  const all = load();
  return all[userId] || [];
};

module.exports = { saveSubscription, removeSubscription, getSubscriptions };
