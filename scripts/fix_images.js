const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Fix Node 22 SRV bug
require('dotenv').config({ path: '.env.local' });
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

async function fixImages() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2. Initialize Firebase Admin
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
    }
    const bucket = admin.storage().bucket();

    // 3. Find broken snaps
    const db = mongoose.connection.db;
    const snaps = await db.collection('lifesnaps').find({ imageUrl: { $regex: '^https://storage.googleapis.com' } }).toArray();
    console.log(`Found ${snaps.length} broken LifeSnaps`);

    let fixedCount = 0;
    for (const snap of snaps) {
      const url = snap.imageUrl;
      const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
      if (url.startsWith(bucketPrefix)) {
          const filePath = decodeURIComponent(url.replace(bucketPrefix, ''));
          const file = bucket.file(filePath);
          
          const [exists] = await file.exists();
          if (exists) {
              const downloadToken = uuidv4();
              await file.setMetadata({
                  metadata: {
                      firebaseStorageDownloadTokens: downloadToken
                  }
              });
              
              const newUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;
              
              // Update LifeSnap
              await db.collection('lifesnaps').updateOne(
                  { _id: snap._id },
                  { $set: { imageUrl: newUrl } }
              );
              
              // Also update User.scanTimeline
              await db.collection('users').updateOne(
                  { _id: snap.userId, 'scanTimeline.imageUrl': url },
                  { $set: { 'scanTimeline.$.imageUrl': newUrl } }
              );
              
              fixedCount++;
              console.log(`Fixed image: ${filePath}`);
          } else {
              console.log(`File does not exist in bucket: ${filePath}`);
          }
      }
    }
    
    console.log(`Successfully fixed ${fixedCount} images.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixImages();
