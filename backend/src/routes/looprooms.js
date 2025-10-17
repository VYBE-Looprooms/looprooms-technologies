const express = require('express');
const { Looproom, LooproomParticipant, User, AIContent } = require('../models');
const { authenticateUser } = require('./auth');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createLooproomSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid('recovery', 'meditation', 'fitness', 'healthy-living', 'wellness', 'music', 'social', 'productivity').required(),
  bannerUrl: Joi.string().uri().optional(),
  isAiAssisted: Joi.boolean().default(false),
  aiPersonality: Joi.object().optional(),
  maxParticipants: Joi.number().integer().min(1).max(1000).default(100),
  musicPlaylist: Joi.array().optional(),
  schedule: Joi.object().optional(),
  settings: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// GET /api/looprooms - Get all active looprooms with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      isLive, 
      isAiAssisted, 
      page = 1, 
      limit = 20,
      sortBy = 'participantCount',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { isActive: true };
    
    if (category) whereClause.category = category;
    if (isLive !== undefined) whereClause.isLive = isLive === 'true';
    if (isAiAssisted !== undefined) whereClause.isAiAssisted = isAiAssisted === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: looprooms } = await Looproom.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'type', 'avatarUrl'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        looprooms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get looprooms error:', error);
    res.status(500).json({
      error: 'Failed to fetch looprooms'
    });
  }
});

// GET /api/looprooms/categories - Get looprooms grouped by category
router.get('/categories', async (req, res) => {
  try {
    const categories = await Looproom.findAll({
      where: { isActive: true },
      attributes: [
        'category',
        [Looproom.sequelize.fn('COUNT', '*'), 'totalRooms'],
        [Looproom.sequelize.fn('SUM', Looproom.sequelize.col('participant_count')), 'totalParticipants'],
        [Looproom.sequelize.fn('COUNT', Looproom.sequelize.literal('CASE WHEN is_live = true THEN 1 END')), 'liveRooms']
      ],
      group: ['category'],
      raw: true
    });

    // Add AI room status for each category
    const categoriesWithAI = categories.map(category => ({
      ...category,
      hasAIRoom: true, // All categories have AI rooms in our system
      aiRoomActive: true // AI rooms are always active
    }));

    res.json({
      success: true,
      data: categoriesWithAI
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories'
    });
  }
});

// GET /api/looprooms/:id - Get specific looproom details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const looproom = await Looproom.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'bio']
        },
        {
          model: LooproomParticipant,
          as: 'participants',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'avatarUrl']
            }
          ]
        }
      ]
    });

    if (!looproom) {
      return res.status(404).json({
        error: 'Looproom not found'
      });
    }

    res.json({
      success: true,
      data: looproom
    });

  } catch (error) {
    console.error('Get looproom error:', error);
    res.status(500).json({
      error: 'Failed to fetch looproom'
    });
  }
});

// POST /api/looprooms - Create new looproom (creators only)
router.post('/', authenticateUser, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createLooproomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Check if user is a creator
    if (req.user.type !== 'creator') {
      return res.status(403).json({
        error: 'Only verified creators can create looprooms'
      });
    }

    const looproom = await Looproom.create({
      ...value,
      creatorId: req.user.id
    });

    // Fetch the created looproom with creator info
    const createdLooproom = await Looproom.findByPk(looproom.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'type', 'avatarUrl']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Looproom created successfully',
      data: createdLooproom
    });

  } catch (error) {
    console.error('Create looproom error:', error);
    res.status(500).json({
      error: 'Failed to create looproom'
    });
  }
});

// POST /api/looprooms/:id/join - Join a looproom
router.post('/:id/join', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { mood } = req.body;

    const looproom = await Looproom.findByPk(id);
    if (!looproom || !looproom.isActive) {
      return res.status(404).json({
        error: 'Looproom not found or inactive'
      });
    }

    // Check if room is full
    if (looproom.participantCount >= looproom.maxParticipants) {
      return res.status(400).json({
        error: 'Looproom is full'
      });
    }

    // Check if user is already in the room
    const existingParticipant = await LooproomParticipant.findOne({
      where: {
        looproomId: id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (existingParticipant) {
      return res.json({
        success: true,
        message: 'Already in looproom',
        data: existingParticipant
      });
    }

    // Add user to looproom
    const participant = await LooproomParticipant.create({
      looproomId: id,
      userId: req.user.id,
      metadata: {
        joinMood: mood,
        joinedVia: 'direct'
      }
    });

    // Update participant count
    await looproom.increment('participantCount');
    await looproom.update({ lastActivityAt: new Date() });

    res.json({
      success: true,
      message: 'Successfully joined looproom',
      data: participant
    });

  } catch (error) {
    console.error('Join looproom error:', error);
    res.status(500).json({
      error: 'Failed to join looproom'
    });
  }
});

// POST /api/looprooms/:id/leave - Leave a looproom
router.post('/:id/leave', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await LooproomParticipant.findOne({
      where: {
        looproomId: id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(404).json({
        error: 'Not currently in this looproom'
      });
    }

    // Calculate time spent
    const timeSpent = Math.floor((new Date() - participant.joinedAt) / 1000);
    
    // Update participant record
    await participant.update({
      isActive: false,
      leftAt: new Date(),
      totalTimeSpent: participant.totalTimeSpent + timeSpent
    });

    // Update looproom participant count
    const looproom = await Looproom.findByPk(id);
    if (looproom) {
      await looproom.decrement('participantCount');
    }

    res.json({
      success: true,
      message: 'Successfully left looproom',
      data: {
        timeSpent,
        totalTimeSpent: participant.totalTimeSpent + timeSpent
      }
    });

  } catch (error) {
    console.error('Leave looproom error:', error);
    res.status(500).json({
      error: 'Failed to leave looproom'
    });
  }
});

// GET /api/looprooms/ai/:category - Get AI looproom for category
router.get('/ai/:category', async (req, res) => {
  try {
    const { category } = req.params;

    // Find or create AI looproom for this category
    let aiLooproom = await Looproom.findOne({
      where: {
        category,
        isAiAssisted: true,
        creatorId: null // AI rooms have no creator
      }
    });

    if (!aiLooproom) {
      // Create AI looproom if it doesn't exist
      const aiPersonalities = {
        'recovery': { name: 'Hope', avatar: '🌱', voice: 'supportive' },
        'meditation': { name: 'Zen', avatar: '🧘', voice: 'calm' },
        'fitness': { name: 'Vigor', avatar: '💪', voice: 'energetic' },
        'healthy-living': { name: 'Nourish', avatar: '🥗', voice: 'supportive' },
        'wellness': { name: 'Harmony', avatar: '✨', voice: 'calm' }
      };

      const personality = aiPersonalities[category];
      if (!personality) {
        return res.status(400).json({
          error: 'Invalid category for AI looproom'
        });
      }

      aiLooproom = await Looproom.create({
        name: `${personality.name}'s ${category.charAt(0).toUpperCase() + category.slice(1)} Room`,
        description: `AI-guided ${category} experience with ${personality.name}`,
        category,
        isAiAssisted: true,
        aiPersonality: personality,
        isLive: true, // AI rooms are always live
        maxParticipants: 1000, // AI rooms can handle more participants
        settings: {
          aiEnabled: true,
          autoContent: true,
          musicEnabled: true
        }
      });
    }

    // Get current AI content for this room
    const currentContent = await AIContent.findOne({
      where: {
        category,
        isActive: true
      },
      order: [['usageCount', 'ASC']] // Rotate content based on usage
    });

    res.json({
      success: true,
      data: {
        looproom: aiLooproom,
        currentContent,
        isActive: true
      }
    });

  } catch (error) {
    console.error('Get AI looproom error:', error);
    res.status(500).json({
      error: 'Failed to get AI looproom'
    });
  }
});

module.exports = router;