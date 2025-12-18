
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = "AIzaSyC7pvkZlVssICf6KjPaH8xkpxZLtOjd5VM"; // First Key (Verified listing models works)

    try {
        console.log("Using API Key:", apiKey.substring(0, 8) + "...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log("Generating content with gemini-flash-latest...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Error:", error);
    }
}

testGemini();
