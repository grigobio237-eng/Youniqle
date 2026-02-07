
const mongoose = require('mongoose');

// External DB URI provided by user
const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkArtworkSchema() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected.');

        const artwork = await conn.collection('artworks').findOne({});
        console.log('Sample Artwork:', JSON.stringify(artwork, null, 2));

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkArtworkSchema();
