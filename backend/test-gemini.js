const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key present:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = "Respond with only this JSON: {\"test\": \"success\", \"message\": \"API is working\"}";
    
    console.log('Sending test request...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Raw response:', text);
    
    // Try to parse JSON with our extraction logic
    try {
      let jsonText = null;
      
      // First try to find JSON between code blocks
      let codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Try to find raw JSON
        let jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0].trim();
        }
      }
      
      if (jsonText) {
        const json = JSON.parse(jsonText);
        console.log('Parsed JSON:', json);
        console.log('✅ Gemini API test successful!');
      } else {
        console.log('❌ No JSON found in response');
      }
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Response was not valid JSON');
    }
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('Please check your GEMINI_API_KEY in the .env file');
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      console.error('API quota exceeded. Please check your usage limits.');
    }
  }
}

testGemini();