const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { sendEmail } = require('../config/email');
const { Waitlist } = require('../models');
const path = require('path');

const router = express.Router();

// Rate limiter for waitlist signups
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups per hour per IP
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many signup attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const waitlistSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid('user', 'creator').default('user'),
  name: Joi.string().min(2).max(100).optional(),
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  location: Joi.string().min(1).max(100).optional(),
  interests: Joi.array().items(Joi.string()).optional()
});

// POST /api/waitlist - Add user to waitlist
router.post('/', waitlistLimiter, async (req, res) => {
  try {

    // Validate input
    const { error, value } = waitlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { email, type, name, firstName, lastName, location, interests } = value;

    console.log('Received waitlist data:', { email, type, name, firstName, lastName, location, interests });

    // Check if email already exists
    const existingUser = await Waitlist.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'This email is already on our waitlist!'
      });
    }

    // Parse name if provided as full name, or use firstName/lastName
    let parsedFirstName = firstName;
    let parsedLastName = lastName;
    
    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      parsedFirstName = nameParts[0] || '';
      parsedLastName = nameParts.slice(1).join(' ') || '';
    }

    // Insert into database
    const newUser = await Waitlist.create({
      email,
      type,
      name: name || `${parsedFirstName} ${parsedLastName}`.trim(),
      firstName: parsedFirstName,
      lastName: parsedLastName,
      location,
      interests: interests || []
    });

    console.log('Created user:', newUser.toJSON());

    // Prepare logo attachment
    const logoPath = path.join(__dirname, '../../assets/Logo_To_Send.png');
    const attachments = [{
      filename: 'logo.png',
      path: logoPath,
      cid: 'logo'
    }];

    // Send welcome email
    const emailTemplate = type === 'creator' ? 'waitlistCreator' : 'waitlistUser';
    const displayName = parsedFirstName || name || 'there';
    
    console.log(`Attempting to send ${emailTemplate} email to ${email} with name: ${displayName}`);
    
    try {
      await sendEmail(email, emailTemplate, { name: displayName }, attachments);
      console.log('✅ Welcome email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail the request if email fails - user is still added to waitlist
    }

    res.status(201).json({
      success: true,
      message: 'Successfully added to waitlist!',
      data: {
        id: newUser.id,
        email: newUser.email,
        type: newUser.type,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add to waitlist. Please try again.'
    });
  }
});

// GET /api/waitlist/stats - Get waitlist statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    const sequelize = require('../config/database');
    
    const stats = await Waitlist.findAll({
      attributes: [
        [sequelize.fn('COUNT', '*'), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'user' THEN 1 END")), 'users'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")), 'creators'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END")), 'today'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END")), 'thisWeek']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;