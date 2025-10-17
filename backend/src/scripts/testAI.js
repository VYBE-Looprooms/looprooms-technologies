const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testAIEndpoints() {
  console.log('🧪 Testing AI API endpoints...\n');

  try {
    // Test 1: Get AI personalities
    console.log('1. Testing AI personalities endpoint...');
    const personalitiesResponse = await axios.get(`${BASE_URL}/api/ai/personalities`);
    console.log('✅ Personalities loaded:', Object.keys(personalitiesResponse.data.data).length);

    // Test 2: Get room status
    console.log('\n2. Testing AI room status endpoint...');
    const roomStatusResponse = await axios.get(`${BASE_URL}/api/ai/room-status`);
    console.log('✅ Room status loaded:', Object.keys(roomStatusResponse.data.data).length, 'rooms');

    // Test 3: Get Loopchain recommendations
    console.log('\n3. Testing Loopchain recommendations...');
    const recommendationsResponse = await axios.get(`${BASE_URL}/api/ai/loopchain-recommendations?mood=anxious`);
    console.log('✅ Recommendations loaded for anxious mood');
    console.log('   Recommended:', recommendationsResponse.data.data.loopchain?.name);

    // Test 4: Get Looprooms
    console.log('\n4. Testing Looprooms endpoint...');
    const looproomsResponse = await axios.get(`${BASE_URL}/api/looprooms`);
    console.log('✅ Looprooms loaded:', looproomsResponse.data.data.looprooms.length);

    // Test 5: Get Loopchains
    console.log('\n5. Testing Loopchains endpoint...');
    const loopchainsResponse = await axios.get(`${BASE_URL}/api/loopchains`);
    console.log('✅ Loopchains loaded:', loopchainsResponse.data.data.loopchains.length);

    // Test 6: Get trending Loopchains
    console.log('\n6. Testing trending Loopchains...');
    const trendingResponse = await axios.get(`${BASE_URL}/api/loopchains/trending`);
    console.log('✅ Trending Loopchains loaded:', trendingResponse.data.data.length);

    console.log('\n🎉 All AI endpoints are working correctly!');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`- AI Personalities: ${Object.keys(personalitiesResponse.data.data).length}`);
    console.log(`- AI Rooms: ${Object.keys(roomStatusResponse.data.data).length}`);
    console.log(`- Looprooms: ${looproomsResponse.data.data.looprooms.length}`);
    console.log(`- Loopchains: ${loopchainsResponse.data.data.loopchains.length}`);
    console.log(`- Trending: ${trendingResponse.data.data.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

async function testAIContent() {
  console.log('\n🎨 Testing AI content generation...\n');

  const categories = ['recovery', 'meditation', 'fitness', 'healthy-living', 'wellness'];
  
  for (const category of categories) {
    try {
      console.log(`Testing ${category} content...`);
      const response = await axios.get(`${BASE_URL}/api/ai/content/${category}?limit=2`);
      const content = response.data.data.content;
      const personality = response.data.data.personality;
      
      console.log(`✅ ${personality.name} (${personality.avatar}): ${content.length} content items`);
      if (content.length > 0) {
        console.log(`   Sample: "${content[0].title}"`);
      }
    } catch (error) {
      console.error(`❌ Failed to load ${category} content:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting AI system tests...\n');
  
  await testAIEndpoints();
  await testAIContent();
  
  console.log('\n✨ AI system testing completed!');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

module.exports = { testAIEndpoints, testAIContent, main };