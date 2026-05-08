const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = 'AIzaSyDDhrNiSVnfc73vtiWDbYW_u8G5ECWHQ1c';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('--- Fetching Available Models ---');
    // Using the same discovery logic as in gemini-engine.ts but via SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach(m => {
        if (m.name.includes('gemini')) {
          console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
        }
      });
    } else {
      console.log('No models found or error in response:', data);
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
