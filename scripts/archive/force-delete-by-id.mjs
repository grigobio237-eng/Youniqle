import mongoose from 'mongoose';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Firebase 초기화
const serviceAccount = JSON.parse(
    readFileSync('./youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json', 'utf8')
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'youniqle-eea2f.firebasestorage.app'
    });
}

const bucket = admin.storage().bucket();

async function deleteByIds() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const idsToDelete = [
            '677334185764d852089201a4',
            '6861611287caa1726264d8f5'
        ];

        for (const id of idsToDelete) {
            const product = await Product.findById(id);
            if (product) {
                console.log(`\n--- DELETING ID: ${id} (${product.name}) ---`);

                // 이미지 정리
                const allUrls = [];
                if (product.images) {
                    product.images.forEach(img => { if (img.url) allUrls.push(img.url); });
                }
                if (product.description && product.description.includes('<img')) {
                    const imgRegex = /<img[^>]+src="([^">]+)"/g;
                    let match;
                    while ((match = imgRegex.exec(product.description)) !== null) {
                        allUrls.push(match[1]);
                    }
                }

                for (const url of allUrls) {
                    if (url.includes('firebasestorage.googleapis.com')) {
                        try {
                            const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                            await bucket.file(decodedPath).delete();
                            console.log(`   Deleted storage: ${decodedPath}`);
                        } catch (e) {
                            console.log(`   Storage file already gone or error: ${url.substring(0, 50)}...`);
                        }
                    }
                }

                await Product.findByIdAndDelete(id);
                console.log(`   Deleted from DB: ${id}`);
            } else {
                console.log(`\nID NOT FOUND: ${id}`);
            }
        }

        console.log('\n✅ Cleanup task finished.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

deleteByIds();
