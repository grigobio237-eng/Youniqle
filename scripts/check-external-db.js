
const mongoose = require('mongoose');

// External DB URI provided by user
const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkExternal() {
    try {
        console.log('Connecting to EXTERNAL DB...');
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected to External DB.');

        // List collections
        const collections = await conn.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Try to find artists or products
        // Assuming collection names based on typical setups, checking 'users', 'artists', 'products', 'posts'
        const potentialCollections = ['users', 'artists', 'products', 'posts', 'artworks'];

        for (const name of potentialCollections) {
            if (collections.find(c => c.name === name)) {
                console.log(`\n--- Sample from '${name}' ---`);
                const sample = await conn.collection(name).findOne({});
                console.log(JSON.stringify(sample, null, 2));
            }
        }

        await conn.close();

    } catch (e) {
        console.error('Connection Failed:', e.message);
    }
}

checkExternal();
