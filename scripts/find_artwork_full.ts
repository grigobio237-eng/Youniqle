import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;

async function findArtwork() {
    if (!EXTERNAL_URI) return;
    let conn;
    try {
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        const art = await conn.collection('artworks').findOne({ title: /눈보라/ });
        if (art) {
            console.log('FULL ARTWORK DATA:');
            console.log(JSON.stringify(art, null, 2));
        } else {
            console.log('Artwork "눈보라" not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) await conn.close();
    }
}
findArtwork();
