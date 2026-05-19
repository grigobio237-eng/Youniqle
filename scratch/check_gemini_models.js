require('dotenv').config({ path: '.env.local' });

async function checkModels(keyName, key) {
    console.log(`\n=== Checking models for ${keyName} ===`);
    if (!key) {
        console.log("Key is missing.");
        return;
    }
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }
        
        if (data.models) {
            console.log(`Found ${data.models.length} models.`);
            const geminiModels = data.models
                .filter(m => m.name.includes('gemini'))
                .map(m => m.name.replace('models/', ''));
            
            console.log("Gemini Models:");
            geminiModels.forEach(m => console.log(`- ${m}`));
        } else {
            console.log("No models returned. Response:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

async function run() {
    await checkModels("GEMINI_API_KEY", process.env.GEMINI_API_KEY);
    await checkModels("GEMINI_STUDIO_API_KEY", process.env.GEMINI_STUDIO_API_KEY);
}

run();
