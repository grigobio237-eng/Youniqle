
const mongoose = require('mongoose');

// Mock env vars for script
const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";
const FIREBASE_BUCKET = "artfactory-482402.firebasestorage.app";

function getFirebaseUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const encodedPath = encodeURIComponent(path);
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodedPath}?alt=media`;
}

async function verify() {
    let conn;
    try {
        console.log('Connecting to External DB...');
        conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();
        console.log('Connected.');

        const artworks = await conn.collection('artworks').find({ status: 'approved' }).limit(3).toArray();
        console.log(`Found ${artworks.length} approved artworks.`);

        if (artworks.length > 0) {
            const artistIds = [...new Set(artworks.map(a => a.artist_id).filter(Boolean))];
            const users = await conn.collection('users').find({
                _id: { $in: artistIds.map(id => new mongoose.Types.ObjectId(id)) }
            }).toArray();

            console.log(`Found ${users.length} related users.`);

            // Verify Mapping
            const art = artworks[0];
            const user = users.find(u => u._id.toString() === art.artist_id?.toString());

            console.log('\n--- Sample Mapping Verification ---');
            console.log('Original Art Title:', art.title);
            console.log('Original Image Path:', art.firebase_storage_path);
            console.log('Generated Image URL:', getFirebaseUrl(art.firebase_storage_path));

            if (user) {
                console.log('Artist Name:', user.username || user.name);
                console.log('Artist Image URL:', getFirebaseUrl(user.profile_image));
            } else {
                console.log('Artist not found for this artwork');
            }
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        if (conn) await conn.close();
    }
}

verify();
