
const mongoose = require('mongoose');

const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkKeysExplicitly() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        const artwork = await conn.collection('artworks').findOne({ status: 'approved' });

        if (artwork) {
            console.log('--- Artwork Keys ---');
            console.log(Object.keys(artwork).sort().join('\n'));

            console.log('\n--- Selected Values ---');
            console.log('size:', artwork.size);
            console.log('price:', artwork.price);
            console.log('rental_price:', artwork.rental_price);
            console.log('status:', artwork.status);
        } else {
            console.log('No artwork found');
        }

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkKeysExplicitly();
