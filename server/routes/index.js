const authRoutes = require('./auth');
const serverRoutes = require('./servers');
const channelRoutes = require('./channels');
const messageRoutes = require('./messages');
const pushRoutes = require('./push');

module.exports = {
  authRoutes,
  serverRoutes,
  channelRoutes,
  messageRoutes,
  pushRoutes
};
