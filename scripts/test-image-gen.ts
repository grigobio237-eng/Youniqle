import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Override console.log and warn/error to capture internal logs of GeminiAIEngine
const logFile = path.resolve(process.cwd(), 'gen_error.log');
fs.writeFileSync(logFile, ''); // Clear file

function logToFile(type: string, args: any[]) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    fs.appendFileSync(logFile, `[${type}] ${msg}\n`);
}

console.log = (...args) => logToFile('LOG', args);
console.warn = (...args) => logToFile('WARN', args);
console.error = (...args) => logToFile('ERROR', args);

async function testPollinations() {
    logToFile('INFO', ['Testing Pollinations Connectivity...']);
    const urls = [
        'https://image.pollinations.ai/prompt/cyberpunk?width=100&height=100', // Standard
        'https://pollinations.ai/p/cyberpunk?width=100&height=100', // Legacy
        'https://image.pollinations.ai/prompt/cyberpunk', // Simple
    ];

    for (const url of urls) {
        try {
            logToFile('INFO', [`Fetching: ${url}`]);
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            logToFile('INFO', [`Status: ${response.status} ${response.statusText}`]);
            if (response.ok) {
                logToFile('SUCCESS', ['Pollinations is working with URL:', url]);
                return;
            }
        } catch (e: any) {
            logToFile('ERROR', [`Failed: ${e.message}`]);
        }
    }
}

async function testImageGen() {
    try {
        // Dynamic import to ensure env vars are loaded
        const { GeminiAIEngine } = await import('../src/lib/ai/gemini-engine');

        logToFile('INFO', ['Testing Image Generation...']);
        // Prompt that matches the "Recovery" theme (similar to Detail Builder context)
        const prompt = "A clean glass of water on a wooden table, sunlight streaming in, high quality, photorealistic, cinematic lighting";
        const outputPath = path.resolve(process.cwd(), 'public/output/test_image_gen.png');

        logToFile('INFO', [`Prompt: ${prompt}`]);
        logToFile('INFO', [`Output: ${outputPath}`]);

        const result = await GeminiAIEngine.generateImageAndSave(prompt, outputPath);

        logToFile('INFO', ['SUCCESS: Image generated at', result]);
    } catch (error: any) {
        logToFile('FATAL', ['FAILURE: Image generation failed', error.message]);
    }
}

testImageGen();
