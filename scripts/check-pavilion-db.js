
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is likely missing in .env.local');
    process.exit(1);
}

const PavilionFloorSchema = new mongoose.Schema({
    floor: { type: Number, required: true },
    owners: [new mongoose.Schema({
        id: String,
        name: String,
        items: [new mongoose.Schema({ title: String, id: String }, { strict: false })]
    }, { strict: false })]
}, { strict: false });

const PavilionFloor = mongoose.models.PavilionFloor || mongoose.model('PavilionFloor', PavilionFloorSchema);

async function check() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const floor1 = await PavilionFloor.findOne({ floor: 1 });
        console.log('Floor 1 Data found:', !!floor1);

        if (floor1) {
            console.log('Owners count:', floor1.owners.length);
            floor1.owners.forEach((o, i) => {
                console.log(`[${i}] ${o.name} (ID: ${o.id}) - Items: ${o.items?.length}`);
            });
        } else {
            console.log('No Floor 1 document found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
