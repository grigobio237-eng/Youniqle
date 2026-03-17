import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;

async function debugData() {
    if (!EXTERNAL_URI) {
        console.error('EXTERNAL_MONGODB_URI is missing');
        return;
    }

    let conn;
    try {
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected.');

        const artworks = await conn.collection('artworks').find({ status: 'approved' }).limit(5).toArray();
        
        console.log('SAMPLE ARTWORKS (Parsed Fields):');
        artworks.forEach((art, i) => {
            console.log(`\n--- Artwork ${i+1}: ${art.title} ---`);
            console.log('Available keys:', Object.keys(art));
            console.log('size:', art.size);
            console.log('canvas_size:', art.canvas_size);
            console.log('dimensions:', art.dimensions);
            console.log('width:', art.width);
            console.log('height:', art.height);
            console.log('ho_size:', art.ho_size);
            console.log('category:', art.category);
            console.log('material:', art.material);
        });

    } catch (err) {
        console.error(err);
    } finally {
        if (conn) await conn.close();
    }
}

debugData();
