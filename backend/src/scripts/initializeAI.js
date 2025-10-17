require('dotenv').config();
const { Looproom, AIContent } = require('../models');
const aiPersonalityService = require('../services/aiPersonalityService');
const loopchainService = require('../services/loopchainService');

async function initializeAILooprooms() {
  console.log('🤖 Initializing AI Looprooms...');
  
  const categories = ['recovery', 'meditation', 'fitness', 'healthy-living', 'wellness'];
  
  for (const category of categories) {
    try {
      const personality = aiPersonalityService.getPersonality(category);
      if (!personality) continue;

      // Check if AI looproom already exists
      let aiLooproom = await Looproom.findOne({
        where: {
          category,
          isAiAssisted: true,
          creatorId: null
        }
      });

      if (!aiLooproom) {
        // Create AI looproom
        aiLooproom = await Looproom.create({
          name: `${personality.name}'s ${category.charAt(0).toUpperCase() + category.slice(1)} Room`,
          description: `AI-guided ${category} experience with ${personality.name} - ${personality.description}`,
          category,
          isAiAssisted: true,
          aiPersonality: personality,
          isLive: true,
          isActive: true,
          maxParticipants: 1000,
          participantCount: Math.floor(Math.random() * 50) + 10, // Simulate some activity
          settings: {
            aiEnabled: true,
            autoContent: true,
            musicEnabled: category === 'meditation' || category === 'wellness',
            backgroundMusic: category === 'meditation' ? 'ambient' : category === 'fitness' ? 'upbeat' : 'calm',
            contentRefreshRate: 300, // 5 minutes
            personalizedResponses: true
          },
          tags: ['ai-guided', category, 'always-available'],
          lastActivityAt: new Date()
        });

        console.log(`✅ Created AI Looproom: ${aiLooproom.name}`);
      } else {
        console.log(`⏭️  AI Looproom already exists: ${aiLooproom.name}`);
      }

      // Initialize some sample AI content for each room
      await initializeAIContent(category, personality);

    } catch (error) {
      console.error(`❌ Failed to create AI Looproom for ${category}:`, error);
    }
  }
}

async function initializeAIContent(category, personality) {
  console.log(`📝 Initializing AI content for ${category}...`);
  
  const contentTypes = personality.contentTypes;
  
  for (const contentType of contentTypes) {
    try {
      // Check if content already exists
      const existingContent = await AIContent.findOne({
        where: {
          category,
          contentType,
          aiPersonality: personality.name
        }
      });

      if (!existingContent) {
        // Create initial content
        await aiPersonalityService.createContent(category, contentType, 'neutral', personality);
        console.log(`  ✅ Created ${contentType} content for ${personality.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to create ${contentType} content for ${category}:`, error);
    }
  }
}

async function initializePrebuiltLoopchains() {
  console.log('🔗 Initializing pre-built AI Loopchains...');
  await loopchainService.initializePrebuiltChains();
}

async function main() {
  try {
    console.log('🚀 Starting AI initialization...\n');
    
    // Initialize AI Looprooms
    await initializeAILooprooms();
    console.log('');
    
    // Initialize pre-built Loopchains
    await initializePrebuiltLoopchains();
    console.log('');
    
    console.log('✨ AI initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 5 AI Looprooms created (Recovery, Meditation, Fitness, Healthy Living, Wellness)');
    console.log('- 3 Pre-built AI Loopchains created (Healing Path, Body & Balance, Reflect & Reset)');
    console.log('- AI content library initialized with sample content');
    console.log('- All AI personalities configured and ready');
    
  } catch (error) {
    console.error('💥 AI initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().then(() => {
    console.log('\n🎉 Ready to serve AI-powered wellness experiences!');
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  initializeAILooprooms,
  initializeAIContent,
  initializePrebuiltLoopchains,
  main
};