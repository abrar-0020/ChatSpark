require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { authRoutes, serverRoutes, channelRoutes, messageRoutes, pushRoutes } = require('./routes');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

app.disable('x-powered-by');
app.set('trust proxy', 1);

const missingEnv = ['JWT_SECRET'].filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required env vars: ${missingEnv.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  process.env.CLIENT_URL
].filter(Boolean);

const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

// Allow any *.vercel.app origin dynamically (opt-in)
const corsOriginFn = (origin, callback) => {
  if (!origin) return callback(null, true); // allow non-browser requests
  if (allowedOrigins.includes(origin) || (allowVercelPreviews && /\.vercel\.app$/.test(origin))) {
    return callback(null, true);
  }
  callback(new Error(`CORS: origin ${origin} not allowed`));
};

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: corsOriginFn,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: corsOriginFn,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again later.'
  }
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/push', pushRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('ChatSpark API is running! Access /api/health for status.');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize Socket.IO
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const DATA_LOCATION = path.join(__dirname, 'storage', 'data');
console.log(`💾 Using local file storage - data persists on disk: ${DATA_LOCATION}`);
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 Access from other devices: http://<your-local-ip>:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
