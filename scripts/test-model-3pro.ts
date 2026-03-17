
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-3-pro-image-preview';

    console.log(`Testing model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const prompt = "A 30-year-old Korean woman with short hair, wearing a pink bucket hat, looking slightly tired in a modern apartment kitchen. Cinematic vertical shot, 9:16 aspect ratio.";

        console.log("Sending generateContent request...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `Generate a photorealistic image: ${prompt}` }] }],
            // @ts-ignore
            generationConfig: {
                imageConfig: {
                    aspectRatio: "9:16",
                    imageSize: "1K"
                }
            } as any
        });

        const response = await result.response;
        console.log("Response received.");

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts?.[0]?.inlineData) {
            console.log("✅ Image data found!");
        } else {
            console.log("❌ No image data in response.");
            console.log("Response text:", response.text());
        }
    } catch (e: any) {
        console.error(`❌ ${modelName} failed: ${e.message}`);
        console.error(e);
    }
}

main();
