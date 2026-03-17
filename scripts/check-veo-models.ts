import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return;
    }

    console.log('--- Listing Models via REST (to see newer/preview models) ---');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        const models = response.data.models || [];

        console.log(`Found ${models.length} models.`);
        const veoModels = models.filter((m: any) => m.name.toLowerCase().includes('veo') || m.name.toLowerCase().includes('video'));

        if (veoModels.length > 0) {
            console.log('--- Found VEO/Video related models! ---');
            veoModels.forEach((m: any) => {
                console.log(`Name: ${m.name}`);
                console.log(`Description: ${m.description}`);
                console.log(`Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
                console.log('---');
            });
        } else {
            console.log('No VEO models found in current API list. They might be restricted or require Vertex AI.');
        }

        // Print a few regular models for confirmation
        console.log('--- Sample Regular Models ---');
        models.slice(0, 5).forEach((m: any) => console.log(m.name));

    } catch (error: any) {
        console.error('Error listing models:', error.response?.data || error.message);
    }
}

listModels();
