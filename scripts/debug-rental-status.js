const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;

async function debugRentalStatus() {
    if (!EXTERNAL_URI) {
        console.error('EXTERNAL_MONGODB_URI is missing');
        return;
    }

    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected to External DB');

        // Fetch a few artworks to see the rental_status field
        const artworks = await conn.collection('artworks').find({}).limit(5).toArray();

        if (artworks.length === 0) {
            console.log('No artworks found.');
        } else {
            console.log('--- Sample Artwork Documents ---');
            artworks.forEach((art, index) => {
                if (art.title === 'Break Time' || index < 3) {
                    console.log(`[${index + 1}] Title: ${art.title}`);
                    console.log(`    Status: ${art.status}`);
                    console.log(`    Rental Status (raw): '${art.rental_status}'`); // Quote to check whitespace
                    console.log(`    Rental Price: ${art.rental_price}`);
                    console.log('-----------------------------------');
                }
            });
        }

        // Check unique values for rental_status
        const rentalStatuses = await conn.collection('artworks').distinct('rental_status');
        console.log('Unique Rental Statuses:', rentalStatuses);

        await conn.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugRentalStatus();
