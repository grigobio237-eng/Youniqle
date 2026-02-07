
const mongoose = require('mongoose');

const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkKeys() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();

        const artwork = await conn.collection('artworks').findOne({});
        if (artwork) {
            console.log('Keys:', Object.keys(artwork).join(', '));
            console.log('Sample userId candidate values:');
            ['userId', 'authorId', 'ownerId', 'artistId', 'user', 'author'].forEach(k => {
                console.log(`${k}:`, artwork[k]);
            });
        } else {
            console.log('No artwork found');
        }

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkKeys();
