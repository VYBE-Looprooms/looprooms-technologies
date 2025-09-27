const express = require('express');
const { Loopchain, LoopchainProgress, User, Looproom } = require('../models');
const { authenticateUser } = require('./auth');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createLoopchainSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('ai-guided', 'creator-built', 'hybrid').default('creator-built'),
  rooms: Joi.array().items(Joi.object({
    roomId: Joi.string().required(),
    order: Joi.number().integer().required(),
    transitionMessage: Joi.string().optional(),
    requiredDuration: Joi.number().integer().min(0).optional(),
    exitCriteria: Joi.array().items(Joi.string()).optional(),
    nextRoomDelay: Joi.number().integer().min(0).default(0)
  })).min(2).required(),
  emotionalJourney: Joi.object().optional(),
  estimatedDuration: Joi.number().integer().min(1).optional(),
  completionRewards: Joi.object().optional(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  tags: Joi.array().items(Joi.string()).optional()
});

// GET /api/loopchains - Get all active loopchains
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      difficulty, 
      featured,
      page = 1, 
      limit = 20,
      sortBy = 'completionCount',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { isActive: true };
    
    if (type) whereClause.type = type;
    if (difficulty) whereClause.difficulty = difficulty;
    if (featured !== undefined) whereClause.isFeatured = featured === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: loopchains } = await Loopchain.findAndCountAll({
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
        loopchains,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get loopchains error:', error);
    res.status(500).json({
      error: 'Failed to fetch loopchains'
    });
  }
});

// GET /api/loopchains/trending - Get trending loopchains
router.get('/trending', async (req, res) => {
  try {
    const trending = await Loopchain.findAll({
      where: { 
        isActive: true,
        completionCount: { [require('sequelize').Op.gt]: 0 }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'type', 'avatarUrl'],
          required: false
        }
      ],
      order: [
        ['completionCount', 'DESC'],
        ['averageRating', 'DESC']
      ],
      limit: 10
    });

    res.json({
      success: true,
      data: trending
    });

  } catch (error) {
    console.error('Get trending loopchains error:', error);
    res.status(500).json({
      error: 'Failed to fetch trending loopchains'
    });
  }
});

// GET /api/loopchains/:id - Get specific loopchain details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const loopchain = await Loopchain.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'bio']
        }
      ]
    });

    if (!loopchain) {
      return res.status(404).json({
        error: 'Loopchain not found'
      });
    }

    res.json({
      success: true,
      data: loopchain
    });

  } catch (error) {
    console.error('Get loopchain error:', error);
    res.status(500).json({
      error: 'Failed to fetch loopchain'
    });
  }
});

// POST /api/loopchains - Create new loopchain (creators only)
router.post('/', authenticateUser, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createLoopchainSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Check if user is a creator
    if (req.user.type !== 'creator') {
      return res.status(403).json({
        error: 'Only verified creators can create loopchains'
      });
    }

    const loopchain = await Loopchain.create({
      ...value,
      creatorId: req.user.id
    });

    // Fetch the created loopchain with creator info
    const createdLoopchain = await Loopchain.findByPk(loopchain.id, {
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
      message: 'Loopchain created successfully',
      data: createdLoopchain
    });

  } catch (error) {
    console.error('Create loopchain error:', error);
    res.status(500).json({
      error: 'Failed to create loopchain'
    });
  }
});

// POST /api/loopchains/:id/start - Start a loopchain journey
router.post('/:id/start', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { startingMood } = req.body;

    const loopchain = await Loopchain.findByPk(id);
    if (!loopchain || !loopchain.isActive) {
      return res.status(404).json({
        error: 'Loopchain not found or inactive'
      });
    }

    // Check if user already has active progress
    let progress = await LoopchainProgress.findOne({
      where: {
        userId: req.user.id,
        loopchainId: id,
        isCompleted: false
      }
    });

    if (progress) {
      // Resume existing progress
      return res.json({
        success: true,
        message: 'Resuming loopchain progress',
        data: progress
      });
    }

    // Create new progress record
    progress = await LoopchainProgress.create({
      userId: req.user.id,
      loopchainId: id,
      startingMood: startingMood || 'neutral',
      currentMood: startingMood || 'neutral'
    });

    res.json({
      success: true,
      message: 'Loopchain journey started',
      data: progress
    });

  } catch (error) {
    console.error('Start loopchain error:', error);
    res.status(500).json({
      error: 'Failed to start loopchain'
    });
  }
});

// PUT /api/loopchains/:id/progress - Update loopchain progress
router.put('/:id/progress', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      currentRoomIndex, 
      completedRoomData, 
      currentMood, 
      timeSpent 
    } = req.body;

    const progress = await LoopchainProgress.findOne({
      where: {
        userId: req.user.id,
        loopchainId: id,
        isCompleted: false
      }
    });

    if (!progress) {
      return res.status(404).json({
        error: 'No active loopchain progress found'
      });
    }

    // Update progress
    const updatedCompletedRooms = [...progress.completedRooms];
    if (completedRoomData) {
      updatedCompletedRooms.push(completedRoomData);
    }

    await progress.update({
      currentRoomIndex: currentRoomIndex || progress.currentRoomIndex,
      completedRooms: updatedCompletedRooms,
      currentMood: currentMood || progress.currentMood,
      totalTimeSpent: progress.totalTimeSpent + (timeSpent || 0),
      lastActiveAt: new Date()
    });

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });

  } catch (error) {
    console.error('Update loopchain progress error:', error);
    res.status(500).json({
      error: 'Failed to update progress'
    });
  }
});

// POST /api/loopchains/:id/complete - Complete a loopchain
router.post('/:id/complete', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { endingMood, rating, feedback } = req.body;

    const progress = await LoopchainProgress.findOne({
      where: {
        userId: req.user.id,
        loopchainId: id,
        isCompleted: false
      }
    });

    if (!progress) {
      return res.status(404).json({
        error: 'No active loopchain progress found'
      });
    }

    // Mark as completed
    await progress.update({
      isCompleted: true,
      completedAt: new Date(),
      endingMood: endingMood || progress.currentMood,
      rating,
      feedback
    });

    // Update loopchain completion count
    const loopchain = await Loopchain.findByPk(id);
    if (loopchain) {
      await loopchain.increment('completionCount');
      
      // Update average rating if rating provided
      if (rating) {
        const allRatings = await LoopchainProgress.findAll({
          where: {
            loopchainId: id,
            isCompleted: true,
            rating: { [require('sequelize').Op.ne]: null }
          },
          attributes: ['rating']
        });
        
        const avgRating = allRatings.reduce((sum, p) => sum + p.rating, 0) / allRatings.length;
        await loopchain.update({ averageRating: avgRating });
      }
    }

    res.json({
      success: true,
      message: 'Loopchain completed successfully!',
      data: {
        progress,
        rewards: loopchain?.completionRewards || {},
        emotionalJourney: {
          startingMood: progress.startingMood,
          endingMood: endingMood || progress.currentMood,
          totalTime: progress.totalTimeSpent
        }
      }
    });

  } catch (error) {
    console.error('Complete loopchain error:', error);
    res.status(500).json({
      error: 'Failed to complete loopchain'
    });
  }
});

module.exports = router;