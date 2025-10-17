const express = require('express');
const { AIContent, Looproom, LooproomParticipant } = require('../models');
const { authenticateUser } = require('./auth');
const aiPersonalityService = require('../services/aiPersonalityService');
const loopchainService = require('../services/loopchainService');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const generateContentSchema = Joi.object({
  category: Joi.string().valid('recovery', 'meditation', 'fitness', 'healthy-living', 'wellness').required(),
  contentType: Joi.string().required(),
  userMood: Joi.string().optional(),
  personalizedFor: Joi.string().optional()
});

const chatSchema = Joi.object({
  category: Joi.string().valid('recovery', 'meditation', 'fitness', 'healthy-living', 'wellness').required(),
  message: Joi.string().min(1).max(500).required(),
  userMood: Joi.string().optional(),
  context: Joi.object().optional()
});

// GET /api/ai/personalities - Get all AI personalities
router.get('/personalities', async (req, res) => {
  try {
    const personalities = {};
    const categories = ['recovery', 'meditation', 'fitness', 'healthy-living', 'wellness'];
    
    for (const category of categories) {
      const personality = aiPersonalityService.getPersonality(category);
      if (personality) {
        personalities[category] = personality;
      }
    }

    res.json({
      success: true,
      data: personalities
    });

  } catch (error) {
    console.error('Get personalities error:', error);
    res.status(500).json({
      error: 'Failed to fetch AI personalities'
    });
  }
});

// GET /api/ai/content/:category - Get AI content for category
router.get('/content/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { contentType, mood = 'neutral', limit = 5 } = req.query;

    const whereClause = {
      category,
      isActive: true
    };

    if (contentType) {
      whereClause.contentType = contentType;
    }

    const content = await AIContent.findAll({
      where: whereClause,
      order: [['usageCount', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Get personality info
    const personality = aiPersonalityService.getPersonality(category);

    res.json({
      success: true,
      data: {
        content,
        personality,
        totalCount: content.length
      }
    });

  } catch (error) {
    console.error('Get AI content error:', error);
    res.status(500).json({
      error: 'Failed to fetch AI content'
    });
  }
});

// POST /api/ai/generate-content - Generate new AI content
router.post('/generate-content', authenticateUser, async (req, res) => {
  try {
    const { error, value } = generateContentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { category, contentType, userMood = 'neutral' } = value;

    const content = await aiPersonalityService.generateContent(category, contentType, userMood);

    res.json({
      success: true,
      message: 'Content generated successfully',
      data: content
    });

  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({
      error: 'Failed to generate content'
    });
  }
});

// POST /api/ai/chat - Chat with AI personality
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { category, message, userMood = 'neutral', context } = value;

    const response = await aiPersonalityService.getPersonalizedResponse(category, message, userMood);
    const personality = aiPersonalityService.getPersonality(category);

    // Log the interaction (could be used for improving AI responses)
    console.log(`AI Chat - ${personality.name}: User said "${message}" (mood: ${userMood})`);

    res.json({
      success: true,
      data: {
        response,
        personality: personality.name,
        mood: userMood,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message'
    });
  }
});

// GET /api/ai/loopchain-recommendations - Get personalized Loopchain recommendations
router.get('/loopchain-recommendations', authenticateUser, async (req, res) => {
  try {
    const { mood = 'neutral', preferences } = req.query;
    
    let userPreferences = {};
    if (preferences) {
      try {
        userPreferences = JSON.parse(preferences);
      } catch (e) {
        // Invalid JSON, use empty preferences
      }
    }

    const recommendation = await loopchainService.getRecommendedChain(mood, userPreferences);

    res.json({
      success: true,
      data: recommendation
    });

  } catch (error) {
    console.error('Get Loopchain recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations'
    });
  }
});

// GET /api/ai/room-status - Get real-time AI room status
router.get('/room-status', async (req, res) => {
  try {
    const categories = ['recovery', 'meditation', 'fitness', 'healthy-living', 'wellness'];
    const roomStatus = {};

    for (const category of categories) {
      const room = await Looproom.findOne({
        where: {
          category,
          isAiAssisted: true,
          creatorId: null
        }
      });

      if (room) {
        const personality = aiPersonalityService.getPersonality(category);
        roomStatus[category] = {
          id: room.id,
          name: room.name,
          isActive: room.isActive,
          isLive: room.isLive,
          participantCount: room.participantCount,
          personality: personality,
          lastActivity: room.lastActivityAt,
          status: room.participantCount > 0 ? 'active' : 'available'
        };
      }
    }

    res.json({
      success: true,
      data: roomStatus
    });

  } catch (error) {
    console.error('Get room status error:', error);
    res.status(500).json({
      error: 'Failed to get room status'
    });
  }
});

// POST /api/ai/room/:category/enter - Enter AI room with mood tracking
router.post('/room/:category/enter', authenticateUser, async (req, res) => {
  try {
    const { category } = req.params;
    const { mood = 'neutral', intention } = req.body;

    // Find AI room for category
    const room = await Looproom.findOne({
      where: {
        category,
        isAiAssisted: true,
        creatorId: null
      }
    });

    if (!room) {
      return res.status(404).json({
        error: 'AI room not found for this category'
      });
    }

    // Check if user is already in room
    let participant = await LooproomParticipant.findOne({
      where: {
        looproomId: room.id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!participant) {
      // Add user to room
      participant = await LooproomParticipant.create({
        looproomId: room.id,
        userId: req.user.id,
        metadata: {
          joinMood: mood,
          intention: intention,
          joinedVia: 'ai-direct'
        }
      });

      // Update room participant count
      await room.increment('participantCount');
      await room.update({ lastActivityAt: new Date() });
    }

    // Get welcome content based on mood
    const welcomeContent = await aiPersonalityService.generateContent(category, 'welcome', mood);
    const personality = aiPersonalityService.getPersonality(category);

    res.json({
      success: true,
      message: `Welcome to ${personality.name}'s room!`,
      data: {
        room,
        participant,
        welcomeContent,
        personality,
        suggestions: await getPersonalizedSuggestions(category, mood)
      }
    });

  } catch (error) {
    console.error('Enter AI room error:', error);
    res.status(500).json({
      error: 'Failed to enter AI room'
    });
  }
});

// Helper function to get personalized suggestions
async function getPersonalizedSuggestions(category, mood) {
  const suggestions = {
    'recovery': {
      'struggling': ['Try a breathing exercise', 'Read an affirmation', 'Connect with the community'],
      'hopeful': ['Set a small goal', 'Practice gratitude', 'Share your progress'],
      'neutral': ['Explore recovery tips', 'Try a mindfulness exercise', 'Read inspiring stories']
    },
    'meditation': {
      'anxious': ['5-minute breathing meditation', 'Body scan practice', 'Calming visualization'],
      'stressed': ['Progressive relaxation', 'Mindful breathing', 'Stress-relief meditation'],
      'neutral': ['Guided meditation', 'Mindfulness practice', 'Breathing exercises']
    },
    'fitness': {
      'sluggish': ['Quick energy workout', 'Stretching routine', 'Motivational content'],
      'energetic': ['High-intensity workout', 'Strength training', 'Challenge yourself'],
      'neutral': ['Balanced workout', 'Fitness tips', 'Movement practice']
    },
    'healthy-living': {
      'tired': ['Nutrition tips', 'Hydration reminder', 'Energy-boosting foods'],
      'motivated': ['Meal planning', 'Healthy recipes', 'Wellness challenges'],
      'neutral': ['Daily health tips', 'Balanced nutrition', 'Wellness practices']
    },
    'wellness': {
      'overwhelmed': ['Gratitude practice', 'Stress management', 'Self-care tips'],
      'happy': ['Positive affirmations', 'Goal setting', 'Celebrate progress'],
      'neutral': ['Wellness tips', 'Balance practices', 'Mindful living']
    }
  };

  return suggestions[category]?.[mood] || suggestions[category]?.['neutral'] || ['Explore the room', 'Try something new', 'Connect with others'];
}

module.exports = router;