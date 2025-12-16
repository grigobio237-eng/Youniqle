const { GoogleGenerativeAI } = require('@google/generative-ai');

// User's NEW key (from .env.local)
const API_KEY = 'AIzaSyDNhmb_-eW7gEpn97qqieuf6M7nW8qTQlk';

async function testGemini() {
    console.log('🔑 Testing API after Billing Activated...');
    const genAI = new GoogleGenerativeAI(API_KEY);

    const models = ['gemini-1.5-flash', 'gemini-pro'];

    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "Connected" if you verify this message.');
            const response = await result.response;
            console.log(`✅ Success with ${modelName}! Response:`, response.text());
        } catch (e) {
            console.log(`❌ Failed with ${modelName}:`, e.message);
        }
    }
}

testGemini();
