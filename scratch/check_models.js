const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const modelList = await genAI.listModels();
    console.log("Available models:");
    modelList.models.forEach((m) => {
      console.log(`- ${m.name} (Methods: ${m.supportedMethods.join(", ")})`);
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
