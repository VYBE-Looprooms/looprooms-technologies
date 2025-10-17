require('dotenv').config();
const { Looproom, AIContent } = require('../models');

const aiLooprooms = [
  {
    name: "Hope's Recovery Circle",
    description: "A safe, supportive space for healing and growth. Hope guides you through recovery with compassion and understanding.",
    category: 'recovery',
    isAiAssisted: true,
    aiPersonality: {
      name: 'Hope',
      avatar: '🌱',
      voice: 'supportive',
      traits: ['compassionate', 'understanding', 'encouraging']
    },
    isLive: true,
    isActive: true,
    maxParticipants: 1000,
    duration: 30,
    participantCount: 0,
    bannerUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
    settings: {
      aiEnabled: true,
      autoContent: true,
      musicEnabled: true,
      allowAnonymous: true
    },
    tags: ['recovery', 'support', 'healing', 'ai-guided']
  },
  {
    name: "Zen's Meditation Haven",
    description: "Find inner peace and mindfulness with Zen. Guided meditation sessions for all experience levels.",
    category: 'meditation',
    isAiAssisted: true,
    aiPersonality: {
      name: 'Zen',
      avatar: '🧘',
      voice: 'calm',
      traits: ['peaceful', 'mindful', 'serene']
    },
    isLive: true,
    isActive: true,
    maxParticipants: 1000,
    duration: 20,
    participantCount: 0,
    bannerUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    settings: {
      aiEnabled: true,
      autoContent: true,
      musicEnabled: true,
      allowAnonymous: false
    },
    tags: ['meditation', 'mindfulness', 'peace', 'ai-guided']
  },
  {
    name: "Vigor's Fitness Zone",
    description: "Get energized and motivated! Vigor brings high-energy workouts and fitness challenges to keep you moving.",
    category: 'fitness',
    isAiAssisted: true,
    aiPersonality: {
      name: 'Vigor',
      avatar: '💪',
      voice: 'energetic',
      traits: ['motivating', 'energetic', 'enthusiastic']
    },
    isLive: true,
    isActive: true,
    maxParticipants: 1000,
    duration: 45,
    participantCount: 0,
    bannerUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    settings: {
      aiEnabled: true,
      autoContent: true,
      musicEnabled: true,
      allowAnonymous: false
    },
    tags: ['fitness', 'workout', 'energy', 'ai-guided']
  },
  {
    name: "Nourish's Wellness Kitchen",
    description: "Discover healthy living with Nourish. Learn about nutrition, healthy habits, and sustainable wellness practices.",
    category: 'healthy-living',
    isAiAssisted: true,
    aiPersonality: {
      name: 'Nourish',
      avatar: '🥗',
      voice: 'supportive',
      traits: ['nurturing', 'knowledgeable', 'encouraging']
    },
    isLive: true,
    isActive: true,
    maxParticipants: 1000,
    duration: 30,
    participantCount: 0,
    bannerUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    settings: {
      aiEnabled: true,
      autoContent: true,
      musicEnabled: true,
      allowAnonymous: false
    },
    tags: ['nutrition', 'healthy-living', 'wellness', 'ai-guided']
  },
  {
    name: "Harmony's Wellness Sanctuary",
    description: "Balance mind, body, and spirit with Harmony. Holistic wellness practices for complete well-being.",
    category: 'wellness',
    isAiAssisted: true,
    aiPersonality: {
      name: 'Harmony',
      avatar: '✨',
      voice: 'calm',
      traits: ['balanced', 'holistic', 'peaceful']
    },
    isLive: true,
    isActive: true,
    maxParticipants: 1000,
    duration: 35,
    participantCount: 0,
    bannerUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
    settings: {
      aiEnabled: true,
      autoContent: true,
      musicEnabled: true,
      allowAnonymous: false
    },
    tags: ['wellness', 'balance', 'holistic', 'ai-guided']
  }
];

const aiContent = [
  // Recovery content
  {
    category: 'recovery',
    contentType: 'affirmation',
    content: 'You are stronger than you think. Every step forward is progress.',
    metadata: { mood: 'hopeful', intensity: 'gentle' },
    isActive: true
  },
  {
    category: 'recovery',
    contentType: 'prompt',
    content: 'What is one thing you are grateful for today?',
    metadata: { mood: 'reflective', intensity: 'gentle' },
    isActive: true
  },
  {
    category: 'recovery',
    contentType: 'exercise',
    content: 'Take three deep breaths. Inhale peace, exhale tension.',
    metadata: { mood: 'calming', intensity: 'gentle' },
    isActive: true
  },

  // Meditation content
  {
    category: 'meditation',
    contentType: 'affirmation',
    content: 'I am present in this moment. My mind is calm and clear.',
    metadata: { mood: 'peaceful', intensity: 'calm' },
    isActive: true
  },
  {
    category: 'meditation',
    contentType: 'prompt',
    content: 'Notice your breath. Where do you feel it most in your body?',
    metadata: { mood: 'mindful', intensity: 'calm' },
    isActive: true
  },
  {
    category: 'meditation',
    contentType: 'exercise',
    content: 'Body scan: Start at your toes and slowly move awareness up through your body.',
    metadata: { mood: 'relaxing', intensity: 'calm' },
    isActive: true
  },

  // Fitness content
  {
    category: 'fitness',
    contentType: 'affirmation',
    content: 'My body is strong and capable. I am getting stronger every day!',
    metadata: { mood: 'energized', intensity: 'high' },
    isActive: true
  },
  {
    category: 'fitness',
    contentType: 'prompt',
    content: 'What fitness goal are you working towards this week?',
    metadata: { mood: 'motivated', intensity: 'high' },
    isActive: true
  },
  {
    category: 'fitness',
    contentType: 'exercise',
    content: '30-second plank challenge! Hold strong, you got this!',
    metadata: { mood: 'challenging', intensity: 'high' },
    isActive: true
  },

  // Healthy Living content
  {
    category: 'healthy-living',
    contentType: 'affirmation',
    content: 'I nourish my body with healthy choices. I deserve to feel good.',
    metadata: { mood: 'positive', intensity: 'moderate' },
    isActive: true
  },
  {
    category: 'healthy-living',
    contentType: 'prompt',
    content: 'What healthy habit would you like to build this month?',
    metadata: { mood: 'reflective', intensity: 'moderate' },
    isActive: true
  },
  {
    category: 'healthy-living',
    contentType: 'exercise',
    content: 'Hydration check! Take a moment to drink a glass of water.',
    metadata: { mood: 'caring', intensity: 'gentle' },
    isActive: true
  },

  // Wellness content
  {
    category: 'wellness',
    contentType: 'affirmation',
    content: 'I am balanced. I honor my mind, body, and spirit.',
    metadata: { mood: 'harmonious', intensity: 'moderate' },
    isActive: true
  },
  {
    category: 'wellness',
    contentType: 'prompt',
    content: 'How can you bring more balance into your life today?',
    metadata: { mood: 'reflective', intensity: 'moderate' },
    isActive: true
  },
  {
    category: 'wellness',
    contentType: 'exercise',
    content: 'Gratitude practice: Name three things that brought you joy this week.',
    metadata: { mood: 'grateful', intensity: 'gentle' },
    isActive: true
  }
];

async function seedAILooprooms() {
  try {
    console.log('🌱 Starting AI Looprooms seeding...');

    // Clear existing AI looprooms
    await Looproom.destroy({
      where: {
        isAiAssisted: true,
        creatorId: null
      }
    });
    console.log('✅ Cleared existing AI looprooms');

    // Create AI looprooms
    const createdRooms = await Looproom.bulkCreate(aiLooprooms);
    console.log(`✅ Created ${createdRooms.length} AI looprooms`);

    // Clear existing AI content
    await AIContent.destroy({
      where: {
        category: ['recovery', 'meditation', 'fitness', 'healthy-living', 'wellness']
      }
    });
    console.log('✅ Cleared existing AI content');

    // Create AI content
    const createdContent = await AIContent.bulkCreate(aiContent);
    console.log(`✅ Created ${createdContent.length} AI content items`);

    console.log('\n🎉 AI Looprooms seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Hope's Recovery Circle (Recovery)`);
    console.log(`   - Zen's Meditation Haven (Meditation)`);
    console.log(`   - Vigor's Fitness Zone (Fitness)`);
    console.log(`   - Nourish's Wellness Kitchen (Healthy Living)`);
    console.log(`   - Harmony's Wellness Sanctuary (Wellness)`);
    console.log(`\n   All rooms are LIVE and ready to join!`);

    return {
      success: true,
      rooms: createdRooms.length,
      content: createdContent.length
    };

  } catch (error) {
    console.error('❌ Error seeding AI looprooms:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAILooprooms()
    .then(() => {
      console.log('\n✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAILooprooms;
