import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const EXTERNAL_URI = process.env.EXTERNAL_MONGODB_URI;

async function scanFields() {
    if (!EXTERNAL_URI) return;
    let conn;
    try {
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        
        const allKeys = new Set();
        const cursor = conn.collection('artworks').find({});
        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            if (doc) {
                Object.keys(doc).forEach(k => allKeys.add(k));
                if (doc.width || doc.height || doc.dimensions || doc.cm_size || doc.canvas_size) {
                    console.log(`Found complex size in doc: ${doc.title}`, {
                        width: doc.width,
                        height: doc.height,
                        dimensions: doc.dimensions,
                        cm_size: doc.cm_size,
                        canvas_size: doc.canvas_size,
                        size: doc.size
                    });
                }
            }
        }
        console.log('ALL UNIQUE KEYS IN ARTWORKS:', Array.from(allKeys));
        
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) await conn.close();
    }
}
scanFields();
