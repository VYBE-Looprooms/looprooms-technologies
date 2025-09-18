const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { sendEmail } = require('../config/email');
const { ContactMessage } = require('../models');
const path = require('path');

const router = express.Router();

// Rate limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 messages per hour per IP
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many messages sent. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
  type: Joi.string().valid('general', 'support', 'partnership', 'creator', 'bug').default('general')
});

// POST /api/contact - Submit contact form
router.post('/', contactLimiter, async (req, res) => {
  try {

    // Validate input
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { name, email, subject, message, type } = value;

    // Insert into database
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      type,
      status: 'new'
    });

    // Prepare logo attachment
    const logoPath = path.join(__dirname, '../../assets/Logo_To_Send.png');
    const attachments = [{
      filename: 'logo.png',
      path: logoPath,
      cid: 'logo'
    }];

    // Send confirmation email to user
    try {
      const typeMessages = {
        general: "We'll review your inquiry and get back to you soon.",
        support: "Our technical support team will investigate your issue and provide assistance.",
        partnership: "Our business development team will review your partnership proposal.",
        creator: "Our creator team will provide you with detailed information about the verification process and creator tools.",
        bug: "Our development team will investigate this bug report and keep you updated on the fix."
      };

      await sendEmail(
        email, 
        'contactConfirmation', 
        { 
          name, 
          message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
          type,
          typeMessage: typeMessages[type] || typeMessages.general
        },
        attachments
      );
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
    }

    // Send notification email to team
    try {
      const teamEmail = process.env.CONTACT_EMAIL || 'contact@vybe.com';
      
      // Enhanced email data based on message type
      const typeConfig = {
        general: {
          label: 'General Inquiry',
          color: '#6B7280',
          priority: 'Standard',
          priorityBg: '#F3F4F6',
          priorityColor: '#6B7280',
          priorityTextColor: '#374151',
          priorityMessage: 'Standard inquiry - respond within 24-48 hours'
        },
        support: {
          label: 'Technical Support',
          color: '#EF4444',
          priority: 'High',
          priorityBg: '#FEF2F2',
          priorityColor: '#EF4444',
          priorityTextColor: '#991B1B',
          priorityMessage: 'Technical support needed - prioritize response within 12-24 hours'
        },
        partnership: {
          label: 'Partnership Inquiry',
          color: '#10B981',
          priority: 'Business',
          priorityBg: '#ECFDF5',
          priorityColor: '#10B981',
          priorityTextColor: '#065F46',
          priorityMessage: 'Business partnership opportunity - forward to business development team'
        },
        creator: {
          label: 'Creator Program',
          color: '#8B5CF6',
          priority: 'Creator',
          priorityBg: '#F5F3FF',
          priorityColor: '#8B5CF6',
          priorityTextColor: '#5B21B6',
          priorityMessage: 'Creator program inquiry - provide detailed information about verification process'
        },
        bug: {
          label: 'Bug Report',
          color: '#F59E0B',
          priority: 'Urgent',
          priorityBg: '#FFFBEB',
          priorityColor: '#F59E0B',
          priorityTextColor: '#92400E',
          priorityMessage: 'Bug report - forward to development team and respond with tracking information'
        }
      };

      const config = typeConfig[type] || typeConfig.general;
      
      await sendEmail(teamEmail, 'contactNotification', {
        name,
        email,
        subject,
        message,
        type,
        typeLabel: config.label,
        typeColor: config.color,
        priority: config.priority,
        priorityBg: config.priorityBg,
        priorityColor: config.priorityColor,
        priorityTextColor: config.priorityTextColor,
        priorityMessage: config.priorityMessage,
        id: newMessage.id,
        timestamp: newMessage.createdAt.toLocaleString()
      });
    } catch (emailError) {
      console.error('Team notification email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.',
      data: {
        id: newMessage.id,
        timestamp: newMessage.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send message. Please try again.'
    });
  }
});

// GET /api/contact/messages - Get contact messages (admin only)
router.get('/messages', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch messages'
    });
  }
});

module.exports = router;