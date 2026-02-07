
const mongoose = require('mongoose');

// External DB URI provided by user
const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkUsers() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected.');

        // List all collections
        const collections = await conn.db.listCollections().toArray();
        console.log('All Collections:', collections.map(c => c.name).join(', '));

        if (collections.find(c => c.name === 'users')) {
            const user = await conn.collection('users').findOne({}); // Get one user
            console.log('Sample User:', JSON.stringify(user, null, 2));
        } else {
            console.log("'users' collection not found.");
        }

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkUsers();
