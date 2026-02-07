
const mongoose = require('mongoose');

const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkFullArtwork() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();

        // Find an artwork that likely has full data
        const artwork = await conn.collection('artworks').findOne({ status: 'approved' });

        console.log('--- Full Artwork Document (Formatted) ---');
        console.dir(artwork, { depth: null });

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkFullArtwork();
