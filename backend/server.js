const express = require('express'); // v3 - CORS + CSP + PayFast fixes
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
require('dotenv').config();

// Use Google DNS for MongoDB SRV resolution (some routers can't resolve SRV records)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Initialize Redis client (connects on import)
require('./lib/redis');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const payfastRoutes = require('./routes/payfast');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Trust proxy is required for secure cookies on Railway (behind load balancer)
// Use 'true' to trust the left-most IP in X-Forwarded-* headers, essential for deep proxy chains
app.set('trust proxy', 1);

app.use(compression());

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "https://www.google-analytics.com", process.env.FRONTEND_URL || "http://localhost:3000"].filter(Boolean),
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      formAction: ["'self'", "https://sandbox.payfast.co.za", "https://www.payfast.co.za"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for loading external images
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  xFrameOptions: { action: "deny" },
  xContentTypeOptions: true,
  xXssProtection: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
}));

// Rate Limiting Configuration
// 1. General Limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// 2. Auth Limiter: 10 requests per 15 minutes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

// Apply General Limiter globally
app.use(generalLimiter);

// Professional CORS Configuration
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  // Production domains (all variations)
  'https://ayoosh.online',
  'https://www.ayoosh.online',
  'https://ayooshonline.com',
  'https://www.ayooshonline.com',
  // Environment variable (Railway/Vercel deployment)
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // Allow all origins in development
      console.log(`CORS: Allowing non-listed origin in dev mode: ${origin}`);
      callback(null, true);
    } else {
      // Log blocked origin for debugging
      console.error(`CORS blocked origin: ${origin}`);
      console.error(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'X-Requested-With']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
  verify: (req, res, buf) => {
    // Capture raw body for PayFast ITN signature verification
    req.rawBody = buf.toString();
  }
}));
app.use(cookieParser());
app.use(mongoSanitize());

// API Routes — registered before DB connects so Express is configured,
// but the server only starts listening once MongoDB is ready (see below).
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payfast', payfastRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/affiliates', require('./routes/affiliates'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/form-submissions', require('./routes/formSubmissions'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});




// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening — this prevents any request
// from arriving before the DB is ready (eliminates the startup race condition).
let server;
console.log(`⏳ Connecting to MongoDB...`);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔒 CORS allowed for: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error — server will NOT start:', err.message);
    process.exit(1);
  });

// Graceful Shutdown for Railway
const gracefulShutdown = async () => {
  console.log('Received kill signal, shutting down gracefully');
  if (!server) return process.exit(0);
  server.close(async () => {
    console.log('Closed out remaining connections');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
