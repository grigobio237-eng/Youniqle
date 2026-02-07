
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    process.exit(1);
}

const PavilionFloorSchema = new mongoose.Schema({
    floor: { type: Number, required: true },
    owners: [new mongoose.Schema({
        id: String,
        name: String,
        image: String,
        items: [new mongoose.Schema({ title: String, id: String, image: String }, { strict: false })]
    }, { strict: false })]
}, { strict: false });

const PavilionFloor = mongoose.models.PavilionFloor || mongoose.model('PavilionFloor', PavilionFloorSchema);

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Find Floor 1
        const floor1 = await PavilionFloor.findOne({ floor: 1 });
        if (!floor1) return;

        // Find the broken test artist
        const badArtistIndex = floor1.owners.findIndex(o => o.id === 'ext-sync-final-test' || o.id === 'sync-final-test');

        if (badArtistIndex > -1) {
            console.log('Found broken artist at index:', badArtistIndex);

            // Update to safe local image
            floor1.owners[badArtistIndex].image = '/artist_master_a.png';

            // Update items as well
            if (floor1.owners[badArtistIndex].items) {
                floor1.owners[badArtistIndex].items.forEach(item => {
                    item.image = '/artist_master_a.png'; // Use safe image
                });
            }

            // Mark as modified because it's a mixed schema array
            floor1.markModified('owners');
            await floor1.save();
            console.log('Fixed broken image URLs.');
        } else {
            console.log('Broken artist not found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fix();
