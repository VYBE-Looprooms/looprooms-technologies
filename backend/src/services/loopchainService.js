const { Loopchain, Looproom } = require('../models');

class LoopchainService {
  constructor() {
    this.prebuiltChains = {
      'healing-path': {
        name: 'Healing Path',
        description: 'A gentle journey from recovery through meditation to wellness',
        type: 'ai-guided',
        difficulty: 'beginner',
        estimatedDuration: 45, // minutes
        rooms: [
          { category: 'recovery', duration: 15, transitionMessage: 'You\'ve taken the first step. Now let\'s find some inner peace.' },
          { category: 'meditation', duration: 15, transitionMessage: 'With a calm mind, let\'s nurture your overall wellness.' },
          { category: 'wellness', duration: 15, transitionMessage: 'You\'ve completed your healing journey. Well done!' }
        ],
        emotionalJourney: {
          startMood: ['struggling', 'overwhelmed', 'seeking-help'],
          progressMoods: ['hopeful', 'calm', 'centered'],
          endMood: ['peaceful', 'renewed', 'balanced']
        },
        completionRewards: {
          badge: 'Healing Warrior',
          points: 150,
          message: 'You\'ve shown incredible courage in your healing journey.'
        }
      },
      'body-balance': {
        name: 'Body & Balance',
        description: 'Energize your body, nourish your health, and find wellness',
        type: 'ai-guided',
        difficulty: 'intermediate',
        estimatedDuration: 60, // minutes
        rooms: [
          { category: 'fitness', duration: 25, transitionMessage: 'Great workout! Now let\'s fuel your body properly.' },
          { category: 'healthy-living', duration: 20, transitionMessage: 'Your body is nourished. Let\'s complete the wellness circle.' },
          { category: 'wellness', duration: 15, transitionMessage: 'Perfect balance achieved! Your body and mind are in harmony.' }
        ],
        emotionalJourney: {
          startMood: ['sluggish', 'unmotivated', 'seeking-energy'],
          progressMoods: ['energized', 'nourished', 'strong'],
          endMood: ['balanced', 'vibrant', 'accomplished']
        },
        completionRewards: {
          badge: 'Wellness Champion',
          points: 200,
          message: 'You\'ve mastered the art of body-mind balance!'
        }
      },
      'reflect-reset': {
        name: 'Reflect & Reset',
        description: 'Find peace through meditation, music, and gentle recovery',
        type: 'ai-guided',
        difficulty: 'beginner',
        estimatedDuration: 40, // minutes
        rooms: [
          { category: 'meditation', duration: 15, transitionMessage: 'Your mind is clear. Let music soothe your soul.' },
          { category: 'music', duration: 15, transitionMessage: 'Refreshed by music, let\'s complete your reset journey.' },
          { category: 'recovery', duration: 10, transitionMessage: 'You\'ve successfully reset. You\'re ready for what comes next.' }
        ],
        emotionalJourney: {
          startMood: ['scattered', 'overwhelmed', 'need-reset'],
          progressMoods: ['centered', 'soothed', 'refreshed'],
          endMood: ['reset', 'clear', 'ready']
        },
        completionRewards: {
          badge: 'Reset Master',
          points: 125,
          message: 'You\'ve mastered the art of mental reset and renewal.'
        }
      }
    };
  }

  async initializePrebuiltChains() {
    console.log('Initializing pre-built AI Loopchains...');
    
    for (const [chainId, chainData] of Object.entries(this.prebuiltChains)) {
      try {
        // Check if chain already exists
        const existingChain = await Loopchain.findOne({
          where: { 
            name: chainData.name,
            type: 'ai-guided'
          }
        });

        if (!existingChain) {
          // Create the loopchain
          const rooms = chainData.rooms.map((room, index) => ({
            roomId: `ai-${room.category}`,
            order: index + 1,
            transitionMessage: room.transitionMessage,
            requiredDuration: room.duration * 60, // Convert to seconds
            exitCriteria: ['time-completed', 'user-ready'],
            nextRoomDelay: 30 // 30 second transition
          }));

          await Loopchain.create({
            name: chainData.name,
            description: chainData.description,
            type: chainData.type,
            rooms: rooms,
            emotionalJourney: chainData.emotionalJourney,
            estimatedDuration: chainData.estimatedDuration,
            completionRewards: chainData.completionRewards,
            difficulty: chainData.difficulty,
            isFeatured: true,
            isActive: true,
            tags: ['ai-guided', 'wellness', 'featured'],
            creatorId: null // AI-created chains have no creator
          });

          console.log(`✅ Created AI Loopchain: ${chainData.name}`);
        } else {
          console.log(`⏭️  AI Loopchain already exists: ${chainData.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create AI Loopchain ${chainData.name}:`, error);
      }
    }
  }

  async getRecommendedChain(userMood, userPreferences = {}) {
    const moodToChain = {
      'struggling': 'healing-path',
      'overwhelmed': 'reflect-reset',
      'anxious': 'reflect-reset',
      'sad': 'healing-path',
      'stressed': 'reflect-reset',
      'sluggish': 'body-balance',
      'unmotivated': 'body-balance',
      'seeking-energy': 'body-balance',
      'neutral': 'healing-path', // Default recommendation
      'happy': 'body-balance',
      'energetic': 'body-balance'
    };

    const recommendedChainId = moodToChain[userMood] || 'healing-path';
    const chainData = this.prebuiltChains[recommendedChainId];

    // Find the actual Loopchain in database
    const loopchain = await Loopchain.findOne({
      where: {
        name: chainData.name,
        type: 'ai-guided'
      }
    });

    return {
      loopchain,
      recommendation: {
        reason: this.getRecommendationReason(userMood, recommendedChainId),
        confidence: 0.85,
        alternativeChains: this.getAlternativeRecommendations(userMood, recommendedChainId)
      }
    };
  }

  getRecommendationReason(userMood, chainId) {
    const reasons = {
      'healing-path': {
        'struggling': 'This gentle path will guide you from struggle to peace through recovery and meditation.',
        'sad': 'A compassionate journey that honors your feelings while guiding you toward wellness.',
        'neutral': 'A balanced approach to wellness that covers recovery, mindfulness, and overall well-being.'
      },
      'body-balance': {
        'sluggish': 'Get your energy flowing with fitness, then nourish your body and find balance.',
        'unmotivated': 'This energizing journey will help you build momentum and motivation.',
        'seeking-energy': 'Perfect for boosting your energy through movement, nutrition, and wellness.',
        'happy': 'Channel your positive energy into physical wellness and balanced living.',
        'energetic': 'Great for when you\'re ready to be active and focus on physical wellness.'
      },
      'reflect-reset': {
        'overwhelmed': 'Take a step back, find your center, and reset your mental state.',
        'anxious': 'Calm your mind through meditation and soothing experiences.',
        'stressed': 'A peaceful journey to help you decompress and find clarity.',
        'scattered': 'Perfect for when you need to gather your thoughts and reset your focus.'
      }
    };

    return reasons[chainId]?.[userMood] || 'This journey is recommended based on your current state and wellness goals.';
  }

  getAlternativeRecommendations(userMood, primaryChainId) {
    const allChains = Object.keys(this.prebuiltChains);
    return allChains
      .filter(chainId => chainId !== primaryChainId)
      .slice(0, 2)
      .map(chainId => ({
        id: chainId,
        name: this.prebuiltChains[chainId].name,
        reason: `Alternative path focusing on ${this.prebuiltChains[chainId].description.toLowerCase()}`
      }));
  }

  async getChainProgress(userId, chainId) {
    // This would integrate with the LoopchainProgress model
    // For now, return a basic structure
    return {
      currentRoom: 0,
      completedRooms: [],
      totalProgress: 0,
      estimatedTimeRemaining: this.prebuiltChains[chainId]?.estimatedDuration || 0
    };
  }

  async generateTransitionContent(fromCategory, toCategory, userProgress) {
    const transitions = {
      'recovery-meditation': [
        'You\'ve shown incredible strength in your recovery journey. Now let\'s find some inner peace through meditation.',
        'From healing comes clarity. Let\'s quiet the mind and center your spirit.'
      ],
      'meditation-wellness': [
        'With a calm and centered mind, you\'re ready to embrace overall wellness.',
        'Your peaceful state is the perfect foundation for holistic well-being.'
      ],
      'fitness-healthy-living': [
        'Your body is energized and strong! Now let\'s nourish it with healthy choices.',
        'Great workout! Your body deserves the best fuel - let\'s explore healthy living.'
      ],
      'healthy-living-wellness': [
        'Your body is well-nourished. Now let\'s complete the circle with overall wellness.',
        'Nutrition is just one part of wellness. Let\'s explore the bigger picture.'
      ],
      'meditation-music': [
        'Your mind is clear and peaceful. Let music continue to soothe your soul.',
        'From inner silence to beautiful sounds - let music be your next guide.'
      ],
      'music-recovery': [
        'Music has refreshed your spirit. Now let\'s complete your reset with gentle recovery.',
        'Renewed by music, you\'re ready for the final step in your journey.'
      ]
    };

    const transitionKey = `${fromCategory}-${toCategory}`;
    const messages = transitions[transitionKey] || [
      `Great progress in ${fromCategory}! Ready to explore ${toCategory}?`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }
}

module.exports = new LoopchainService();