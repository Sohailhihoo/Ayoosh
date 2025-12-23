const User = require('../models/User');
const redisClient = require('../lib/redis');

/**
 * Protect routes - require authentication via Redis session
 * This is the gatekeeper. It validates the cookie against Redis.
 */
exports.protect = async (req, res, next) => {
  try {
    let sessionId;

    // Check if cookie exists
    if (req.cookies && req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
    }

    // If no session ID found in cookies
    if (!sessionId) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    // 1. Check Redis for the session
    const userId = await redisClient.get(`session:${sessionId}`);

    if (!userId) {
      // Session exists in cookie but NOT in Redis (Expired or Revoked)
      // Clear the invalid cookie so the browser stops sending it
      res.clearCookie('sessionId');
      return res.status(401).json({ success: false, message: 'Session expired or invalid' });
    }

    // 2. Fetch User from MongoDB
    // We attach the user to the request object so controllers can use it
    const user = await User.findById(userId).select('-password');

    if (!user) {
      // Edge case: User was deleted from DB while session was active
      await redisClient.del(`session:${sessionId}`);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // 3. Attach user and move on
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Optional authentication - continues even without session
 * Use for routes that behave differently for logged-in users
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (sessionId) {
      const userId = await redisClient.get(`session:${sessionId}`);
      if (userId) {
        req.user = await User.findById(userId).select('-password');
      }
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

/**
 * Restrict to specific roles
 * Must be used after protect middleware
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
