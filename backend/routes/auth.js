const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');
const redisClient = require('../lib/redis');
const sendRegisterationEmail = require("../utils/sendRegisterationEmail");
const { generateSecret, generateURI, verify: verifyTOTP } = require('otplib');
const QRCode = require('qrcode');

// Session configuration
const SESSION_EXPIRY = 604800; // 7 days in seconds

/**
 * Helper function to create session and set cookie
 */
const createSession = async (res, userId) => {
  // Generate a random Session ID (32 bytes = 64 hex characters)
  const sessionId = crypto.randomBytes(32).toString('hex');

  // Store in Redis: key = session:{sessionId}, value = userId, expiry = 7 days
  await redisClient.setEx(`session:${sessionId}`, SESSION_EXPIRY, userId.toString());

  // Determine if we are in a secure environment (Production or Railway)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT_NAME;

  console.log(`Creating session. Env: ${process.env.NODE_ENV}, Railway: ${process.env.RAILWAY_ENVIRONMENT_NAME}, Secure: ${isProduction}`);

  // Send session ID as HttpOnly Cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,           // Prevents JavaScript access (XSS protection)
    secure: isProduction,     // HTTPS only in production/Railway
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-site (backend on different domain)
    maxAge: SESSION_EXPIRY * 1000,  // Convert to milliseconds
    path: '/' // Explicitly set path to root
  });

  return sessionId; // Return token for fallback usage
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Create session and set cookie
    const token = await createSession(res, user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token, // Send token to client
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  await sendRegisterationEmail(email);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate Input
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 2. Find User (explicitly select password since it's excluded by default in schema)
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
    console.log(`Login attempt for: ${email}`);

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Verify Password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Admin → TOTP step; everyone else → issue session immediately
    if (user.role === 'admin') {
      const pendingToken = crypto.randomBytes(32).toString('hex');
      const userId = user._id.toString();

      // totpEnabled is not select:false, so it's already on the `user` object
      if (!user.totpEnabled) {
        // First-time setup: generate secret + QR + recovery codes
        const secret = generateSecret();
        const otpauthUrl = generateURI({ type: 'totp', label: user.email, secret, issuer: 'Ayoosh Admin' });
        const qrUri = await QRCode.toDataURL(otpauthUrl);

        const recoveryCodes = Array.from({ length: 8 }, () =>
          crypto.randomBytes(4).toString('hex') + '-' +
          crypto.randomBytes(2).toString('hex') + '-' +
          crypto.randomBytes(2).toString('hex')
        );
        const hashedCodes = recoveryCodes.map(c =>
          crypto.createHash('sha256').update(c).digest('hex')
        );

        await redisClient.setEx(
          `totp_setup:${pendingToken}`,
          600,
          JSON.stringify({ userId, secret, hashedCodes })
        );

        return res.json({
          success: true,
          totpSetupRequired: true,
          pendingToken,
          qrUri,
          recoveryCodes,
        });
      }

      // TOTP already configured — just need the code
      await redisClient.setEx(`totp_pending:${pendingToken}`, 300, userId);

      return res.json({
        success: true,
        totpRequired: true,
        pendingToken,
      });
    }

    // 5. Non-admin: issue session as normal
    const token = await createSession(res, user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/totp/setup/confirm
// @desc    Verify first TOTP code, save secret + recovery codes, issue session
// @access  Public
router.post('/totp/setup/confirm', async (req, res) => {
  try {
    const { pendingToken, code } = req.body;
    if (!pendingToken || !code) {
      return res.status(400).json({ success: false, message: 'pendingToken and code are required' });
    }

    const raw = await redisClient.get(`totp_setup:${pendingToken}`);
    if (!raw) {
      return res.status(401).json({ success: false, message: 'Setup session expired. Please log in again.' });
    }

    const { userId, secret, hashedCodes } = JSON.parse(raw);

    // Atomic attempt counter — invalidate setup session after 5 wrong codes
    const setupAttemptsKey = `totp_setup_attempts:${pendingToken}`;
    const setupAttempts = await redisClient.incr(setupAttemptsKey);
    if (setupAttempts === 1) await redisClient.expire(setupAttemptsKey, 600);
    if (setupAttempts > 5) {
      await redisClient.del(`totp_setup:${pendingToken}`);
      return res.status(401).json({ success: false, message: 'Too many failed attempts. Please log in again.' });
    }

    const { valid: isValid } = await verifyTOTP({ token: String(code).trim(), secret });
    if (!isValid) {
      const remaining = 5 - setupAttempts;
      return res.status(401).json({ success: false, message: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` });
    }

    await redisClient.del(setupAttemptsKey);

    await User.findByIdAndUpdate(userId, {
      totpSecret: secret,
      totpEnabled: true,
      recoveryCodes: hashedCodes.map(c => ({ code: c, used: false })),
    });

    await redisClient.del(`totp_setup:${pendingToken}`);

    const user = await User.findById(userId);
    const token = await createSession(res, user._id);

    res.json({
      success: true,
      message: 'Two-factor authentication enabled',
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('TOTP setup confirm error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/totp/verify
// @desc    Verify TOTP code (or recovery code) and issue session
// @access  Public
router.post('/totp/verify', async (req, res) => {
  try {
    const { pendingToken, code } = req.body;
    if (!pendingToken || !code) {
      return res.status(400).json({ success: false, message: 'pendingToken and code are required' });
    }

    const userId = await redisClient.get(`totp_pending:${pendingToken}`);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    const attemptsKey = `totp_attempts:${userId}`;
    const currentAttempts = parseInt(await redisClient.get(attemptsKey) || '0');
    if (currentAttempts >= 5) {
      // Don't delete attemptsKey — let it expire so lockout can't be bypassed by re-login
      await redisClient.del(`totp_pending:${pendingToken}`);
      return res.status(401).json({ success: false, message: 'Too many failed attempts. Please log in again.' });
    }

    const user = await User.findById(userId).select('+totpSecret +recoveryCodes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const trimmed = String(code).trim();
    let verified = false;

    if (/^\d{6}$/.test(trimmed)) {
      // Standard TOTP code
      const { valid } = await verifyTOTP({ token: trimmed, secret: user.totpSecret });
      verified = valid;
    } else {
      // Recovery code — hash and compare
      const hashed = crypto.createHash('sha256').update(trimmed).digest('hex');
      const entry = user.recoveryCodes.find(r => !r.used && r.code === hashed);
      if (entry) {
        entry.used = true;
        await user.save();
        verified = true;
      }
    }

    if (!verified) {
      // Atomic increment — no read-modify-write race
      const newCount = await redisClient.incr(attemptsKey);
      if (newCount === 1) await redisClient.expire(attemptsKey, 300);
      const remaining = Math.max(0, 5 - newCount);
      return res.status(401).json({
        success: false,
        message: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    await Promise.all([
      redisClient.del(`totp_pending:${pendingToken}`),
      redisClient.del(attemptsKey), // safe to clear on success — lockout only needed for failures
    ]);

    const token = await createSession(res, user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('TOTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/totp/regenerate
// @desc    Reset TOTP — clears secret so admin must re-setup on next login
// @access  Private (admin only) — requires current TOTP code as step-up auth
router.post('/totp/regenerate', protect, authorize('admin'), async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Current TOTP code is required to reset the authenticator.' });
    }

    const regenAttemptsKey = `totp_regen_attempts:${req.user._id}`;
    const regenAttempts = await redisClient.incr(regenAttemptsKey);
    if (regenAttempts === 1) await redisClient.expire(regenAttemptsKey, 300);
    if (regenAttempts > 5) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Try again later.' });
    }

    const user = await User.findById(req.user._id).select('+totpSecret +recoveryCodes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const trimmed = String(code).trim();
    let verified = false;

    if (/^\d{6}$/.test(trimmed)) {
      const { valid } = await verifyTOTP({ token: trimmed, secret: user.totpSecret });
      verified = valid;
    } else {
      // Allow a recovery code as step-up too
      const hashed = crypto.createHash('sha256').update(trimmed).digest('hex');
      const entry = user.recoveryCodes.find(r => !r.used && r.code === hashed);
      if (entry) {
        entry.used = true;
        await user.save();
        verified = true;
      }
    }

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Incorrect TOTP code. Authenticator not reset.' });
    }

    await redisClient.del(regenAttemptsKey);

    await User.findByIdAndUpdate(req.user._id, {
      $unset: { totpSecret: 1 },
      totpEnabled: false,
      recoveryCodes: [],
    });

    res.json({ success: true, message: 'Authenticator reset. Re-scan the QR code on your next login.' });
  } catch (error) {
    console.error('TOTP regenerate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    // Invalidate old session and create new one
    const oldSessionId = req.cookies.sessionId;
    if (oldSessionId) {
      await redisClient.del(`session:${oldSessionId}`);
    }
    await createSession(res, user._id);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (destroy session)
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
      // 1. Remove from Redis (Instant Revocation)
      await redisClient.del(`session:${sessionId}`);
    }

    // 2. Clear the cookie on the browser
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // TODO: Send email with reset token
    // In production, send email with: ${req.protocol}://${req.get('host')}/reset-password/${resetToken}

    res.json({
      success: true,
      message: 'Password reset email sent',
      // Remove in production - only for testing
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Create session and set cookie
    await createSession(res, user._id);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
