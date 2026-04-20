const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function checkModel(modelName) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hi");
    console.log(`Model ${modelName}: SUCCESS`);
  } catch (error) {
    console.log(`Model ${modelName}: FAILED - ${error.message}`);
  }
}

async function run() {
  await checkModel("gemini-1.5-flash");
}

run();
