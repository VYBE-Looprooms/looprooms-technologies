const { AIContent } = require('../models');

class AIPersonalityService {
  constructor() {
    this.personalities = {
      'recovery': {
        name: 'Hope',
        avatar: '🌱',
        voice: 'supportive',
        description: 'Your compassionate recovery companion',
        traits: ['empathetic', 'encouraging', 'patient', 'understanding'],
        contentTypes: ['affirmations', 'recovery-tips', 'motivational-quotes', 'breathing-exercises'],
        responseStyle: 'warm and supportive'
      },
      'meditation': {
        name: 'Zen',
        avatar: '🧘',
        voice: 'calm',
        description: 'Your peaceful meditation guide',
        traits: ['serene', 'mindful', 'wise', 'centered'],
        contentTypes: ['guided-meditations', 'mindfulness-tips', 'breathing-techniques', 'zen-quotes'],
        responseStyle: 'calm and centered'
      },
      'fitness': {
        name: 'Vigor',
        avatar: '💪',
        voice: 'energetic',
        description: 'Your energetic fitness trainer',
        traits: ['motivating', 'energetic', 'goal-oriented', 'positive'],
        contentTypes: ['workout-routines', 'fitness-tips', 'motivation', 'exercise-demos'],
        responseStyle: 'energetic and motivating'
      },
      'healthy-living': {
        name: 'Nourish',
        avatar: '🥗',
        voice: 'supportive',
        description: 'Your nurturing wellness guide',
        traits: ['nurturing', 'knowledgeable', 'caring', 'holistic'],
        contentTypes: ['nutrition-tips', 'healthy-recipes', 'wellness-advice', 'hydration-reminders'],
        responseStyle: 'nurturing and informative'
      },
      'wellness': {
        name: 'Harmony',
        avatar: '✨',
        voice: 'calm',
        description: 'Your balanced wellness companion',
        traits: ['balanced', 'harmonious', 'uplifting', 'insightful'],
        contentTypes: ['gratitude-practices', 'affirmations', 'wellness-tips', 'positive-psychology'],
        responseStyle: 'balanced and uplifting'
      }
    };
  }

  getPersonality(category) {
    return this.personalities[category] || null;
  }

  async generateContent(category, contentType, userMood = 'neutral') {
    const personality = this.getPersonality(category);
    if (!personality) {
      throw new Error(`Unknown personality category: ${category}`);
    }

    // Try to get existing content first
    let content = await AIContent.findOne({
      where: {
        category,
        contentType,
        isActive: true
      },
      order: [['usageCount', 'ASC']] // Rotate content
    });

    if (!content) {
      // Generate new content based on personality and mood
      content = await this.createContent(category, contentType, userMood, personality);
    }

    // Update usage count
    if (content) {
      await content.increment('usageCount');
    }

    return content;
  }

  async createContent(category, contentType, userMood, personality) {
    const contentTemplates = this.getContentTemplates(category, contentType, userMood);
    const template = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];

    const content = await AIContent.create({
      category,
      contentType,
      title: template.title,
      content: template.content,
      metadata: {
        personality: personality.name,
        targetMood: userMood,
        generatedAt: new Date(),
        style: personality.responseStyle
      },
      aiPersonality: personality.name,
      effectivenessScore: 0.8, // Default score
      isActive: true
    });

    return content;
  }

  getContentTemplates(category, contentType, userMood) {
    const templates = {
      'recovery': {
        'affirmations': [
          {
            title: 'Daily Recovery Affirmation',
            content: 'Today I choose healing over hurting. Every step forward, no matter how small, is progress worth celebrating. I am stronger than my struggles and worthy of peace.'
          },
          {
            title: 'Strength in Recovery',
            content: 'Recovery is not a destination, it\'s a daily choice. I honor my journey and trust in my ability to grow. Each moment of clarity is a gift I give myself.'
          }
        ],
        'recovery-tips': [
          {
            title: 'Mindful Moment Practice',
            content: 'When cravings arise, try the 5-4-3-2-1 technique: Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This grounds you in the present moment.'
          },
          {
            title: 'Building Your Support Network',
            content: 'Recovery thrives in community. Reach out to one person today - a friend, family member, or support group member. Connection is medicine for the soul.'
          }
        ]
      },
      'meditation': {
        'guided-meditations': [
          {
            title: '5-Minute Breathing Space',
            content: 'Find a comfortable position. Close your eyes gently. Breathe naturally and notice each inhale bringing calm, each exhale releasing tension. Let thoughts pass like clouds in the sky.'
          },
          {
            title: 'Body Scan Meditation',
            content: 'Starting from your toes, slowly scan up through your body. Notice any tension without judgment. Breathe into tight areas and let them soften with each exhale.'
          }
        ],
        'mindfulness-tips': [
          {
            title: 'Present Moment Awareness',
            content: 'Mindfulness is not about emptying your mind, but about noticing what\'s there without getting caught up in it. Be curious about your experience, not critical.'
          }
        ]
      },
      'fitness': {
        'workout-routines': [
          {
            title: 'Quick Energy Boost',
            content: '10 jumping jacks, 10 push-ups, 10 squats, 30-second plank. Repeat 3 times. Your body is capable of amazing things - let\'s prove it together!'
          },
          {
            title: 'Strength Building Circuit',
            content: 'Bodyweight squats x15, Push-ups x10, Lunges x12 each leg, Mountain climbers x20. Rest 60 seconds between exercises. You\'ve got this!'
          }
        ],
        'motivation': [
          {
            title: 'Your Fitness Journey',
            content: 'Every workout is a victory, no matter how small. Your body is thanking you for every movement. Progress isn\'t always visible, but it\'s always happening.'
          }
        ]
      },
      'healthy-living': {
        'nutrition-tips': [
          {
            title: 'Hydration Reminder',
            content: 'Your body is about 60% water - honor that! Start your day with a glass of water and aim for 8 glasses throughout the day. Add lemon or cucumber for variety.'
          },
          {
            title: 'Mindful Eating Practice',
            content: 'Before your next meal, take three deep breaths. Eat slowly, savoring each bite. Notice colors, textures, and flavors. Your body knows what it needs.'
          }
        ],
        'healthy-recipes': [
          {
            title: 'Energy Bowl Recipe',
            content: 'Quinoa base + roasted vegetables + avocado + hemp seeds + tahini dressing. This bowl provides sustained energy and nourishes every cell in your body.'
          }
        ]
      },
      'wellness': {
        'gratitude-practices': [
          {
            title: 'Three Good Things',
            content: 'Before bed, write down three things that went well today and why you think they happened. This simple practice rewires your brain for positivity.'
          },
          {
            title: 'Gratitude in Challenges',
            content: 'Even difficult moments offer gifts - resilience, wisdom, compassion. What is today\'s challenge teaching you? How is it helping you grow?'
          }
        ],
        'affirmations': [
          {
            title: 'Wellness Affirmation',
            content: 'I am worthy of wellness in all its forms. My mind, body, and spirit deserve care and attention. I choose practices that honor my whole self.'
          }
        ]
      }
    };

    return templates[category]?.[contentType] || [];
  }

  async getPersonalizedResponse(category, userMessage, userMood = 'neutral') {
    const personality = this.getPersonality(category);
    if (!personality) {
      return null;
    }

    // Simple response generation based on personality traits
    const responses = this.generatePersonalizedResponses(personality, userMessage, userMood);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generatePersonalizedResponses(personality, userMessage, userMood) {
    const moodResponses = {
      'anxious': [
        `I hear that you're feeling anxious. Let's take this one breath at a time. ${personality.name} is here with you.`,
        `Anxiety is temporary, but your strength is permanent. What's one small thing that might bring you comfort right now?`
      ],
      'sad': [
        `It's okay to feel sad. Your emotions are valid and ${personality.name} is here to support you through this.`,
        `Sadness is part of the human experience. Let's find a gentle way to honor what you're feeling.`
      ],
      'stressed': [
        `Stress is your body's way of saying it needs attention. Let's find a moment of calm together.`,
        `You're handling more than you realize. ${personality.name} believes in your ability to find balance.`
      ],
      'neutral': [
        `${personality.name} is glad you're here. What would feel most supportive for you right now?`,
        `Welcome to this space of ${personality.description.toLowerCase()}. How can we make this moment meaningful?`
      ],
      'happy': [
        `Your positive energy is wonderful! ${personality.name} loves seeing you in this space.`,
        `It's beautiful when you shine like this. Let's build on this positive momentum.`
      ]
    };

    return moodResponses[userMood] || moodResponses['neutral'];
  }
}

module.exports = new AIPersonalityService();