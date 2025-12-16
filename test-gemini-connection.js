const { GoogleGenerativeAI } = require('@google/generative-ai');

// User's NEW key
const API_KEY = 'AIzaSyDNhmb_-eW7gEpn97qqieuf6M7nW8qTQlk';

async function testGemini() {
    console.log('🔑 Testing New Key with gemini-1.5-flash...');
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Answer "Yes" if you are working.');
        const response = await result.response;
        console.log('✅ Success! Raw Text:', response.text());
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGemini();
