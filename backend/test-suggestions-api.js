const fetch = require('node-fetch');

async function testSuggestionsAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('Testing Suggestions API...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing health check...');
    const response = await fetch(`${baseURL}/suggestions/health`);
    const result = await response.json();
    console.log('✅ Health check:', result);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Submit a suggestion (should work without auth)
  try {
    console.log('\n2. Testing suggestion submission...');
    const response = await fetch(`${baseURL}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        country: 'Test Country',
        looproomName: 'Test Looproom',
        purpose: 'This is a test suggestion for debugging purposes.'
      }),
    });
    const result = await response.json();
    console.log('✅ Suggestion submission:', result);
  } catch (error) {
    console.log('❌ Suggestion submission failed:', error.message);
  }
  
  // Test 3: Try to get stats without auth (should fail)
  try {
    console.log('\n3. Testing stats without auth (should fail)...');
    const response = await fetch(`${baseURL}/suggestions/stats`);
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('❌ Stats without auth failed (expected):', error.message);
  }
  
  // Test 4: Try to get suggestions without auth (should fail)
  try {
    console.log('\n4. Testing suggestions list without auth (should fail)...');
    const response = await fetch(`${baseURL}/suggestions`);
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('❌ Suggestions list without auth failed (expected):', error.message);
  }
}

testSuggestionsAPI().catch(console.error);