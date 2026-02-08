const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;

async function debugArtistFields() {
    if (!EXTERNAL_URI) {
        console.error('EXTERNAL_MONGODB_URI is missing');
        return;
    }

    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected to External DB');

        // Fetch one user (artist)
        const user = await conn.collection('users').findOne({});

        if (!user) {
            console.log('No users found.');
        } else {
            console.log('--- Sample User Document ---');
            console.log('Keys:', Object.keys(user));
            console.log('ID:', user._id);
            console.log('Username:', user.username);
            console.log('Name:', user.name);
            console.log('Intro:', user.introduction);
            console.log('Bio:', user.bio);
            console.log('Description:', user.description);
            console.log('Full Object:', JSON.stringify(user, null, 2));
        }

        await conn.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugArtistFields();
