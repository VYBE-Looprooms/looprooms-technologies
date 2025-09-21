const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { User } = require('../models');
const { sendEmail } = require('../config/email');
const crypto = require('crypto');

const router = express.Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups per hour per IP
  message: {
    error: 'Too many signup attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const signupSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
  type: Joi.string().valid('user', 'creator').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required()
});

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: user.type,
      verified: user.verified
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/auth/signup - User registration
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message
      });
    }

    const { firstName, lastName, email, password, type } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: `${firstName} ${lastName}`,
      type: 'user', // Always start as user
      intendedType: type, // Track what they want to become
      verified: false,
      verificationToken
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail(email, 'emailVerification', {
        name: firstName,
        verificationUrl
      });
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          verified: user.verified
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create account. Please try again.'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', authLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(401).json({
        error: 'Email not verified',
        message: 'Please verify your email address before signing in'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    await user.update({ 
      updatedAt: new Date() 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          intendedType: user.intendedType,
          verified: user.verified
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed. Please try again.'
    });
  }
});

// GET /api/auth/verify-email - Email verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing verification token',
        message: 'Verification token is required'
      });
    }

    // Find user with verification token
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({
        error: 'Invalid verification token',
        message: 'The verification link is invalid or has expired'
      });
    }

    // Update user as verified
    await user.update({
      verified: true,
      verificationToken: null
    });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now sign in to your account.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Email verification failed. Please try again.'
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message
      });
    }

    const { email } = value;

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await user.update({
      verificationToken: resetToken,
      // We'll use updatedAt to track token expiry for now
      updatedAt: resetTokenExpiry
    });

    // Send reset email
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail(email, 'passwordReset', {
        name: user.name.split(' ')[0],
        resetUrl
      });
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process password reset request. Please try again.'
    });
  }
});

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message
      });
    }

    const { token, password } = value;

    // Find user with reset token
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({
        error: 'Invalid reset token',
        message: 'The password reset link is invalid or has expired'
      });
    }

    // Check if token is expired (1 hour)
    const tokenAge = Date.now() - new Date(user.updatedAt).getTime();
    if (tokenAge > 60 * 60 * 1000) {
      return res.status(400).json({
        error: 'Reset token expired',
        message: 'The password reset link has expired. Please request a new one.'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    await user.update({
      passwordHash,
      verificationToken: null,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset password. Please try again.'
    });
  }
});

// POST /api/auth/logout - User logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.verified) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }
};

// GET /api/auth/me - Get current user info
router.get('/me', authenticateUser, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        type: req.user.type,
        verified: req.user.verified
      }
    }
  });
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, bio } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    await req.user.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          type: req.user.type,
          verified: req.user.verified,
          bio: req.user.bio
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile. Please try again.'
    });
  }
});

module.exports = { router, authenticateUser };