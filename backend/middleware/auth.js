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
    console.log('[Auth] Headers Cookie:', req.headers.cookie);

    if (req.cookies && req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
      console.log('[Auth] Found session cookie:', sessionId.substring(0, 6) + '...');
    } else {
      console.log('[Auth] No session cookie found');
    }

    // If no session ID found in cookies
    if (!sessionId) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    // 1. Check Redis for the session
    const userId = await redisClient.get(`session:${sessionId}`);

    // DEBUG LOGGING
    console.log(`[Auth] Check - SessionID: ${sessionId ? sessionId.substring(0, 6) + '...' : 'null'}`);
    console.log(`[Auth] Redis Result for session:${sessionId ? sessionId.substring(0, 6) + '...' : 'null'} -> ${userId}`);

    if (!userId) {
      console.log('[Auth] Session NOT found in Redis or Expired');
      // Session exists in cookie but NOT in Redis (Expired or Revoked)
      // Clear the invalid cookie so the browser stops sending it
      res.clearCookie('sessionId');
      return res.status(401).json({ success: false, message: 'Session expired or invalid' });
    }

    // 2. Fetch User from MongoDB
    // We attach the user to the request object so controllers can use it
    const user = await User.findById(userId).select('-password');

    // DEBUG LOGGING
    console.log(`[Auth] User Lookup: ${user ? user.email : 'NOT FOUND'} (Role: ${user ? user.role : 'N/A'})`);

    if (!user) {
      console.log('[Auth] User not found in DB');
      // Edge case: User was deleted from DB while session was active
      await redisClient.del(`session:${sessionId}`);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      console.log(`[Auth] Deactivated user attempted access: ${user.email}`);
      await redisClient.del(`session:${sessionId}`);
      res.clearCookie('sessionId');
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    // 3. Attach user and move on
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
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
        const user = await User.findById(userId).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
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
