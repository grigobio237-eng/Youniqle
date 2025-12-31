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

async function listAndDelete() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const products = await Product.find({});
        console.log(`Found ${products.length} products total.`);

        for (const p of products) {
            // 이름에 '썬크림'이 포함되어 있거나 슬러그가 'sun-cream'인 경우
            const isTarget = p.name?.includes('썬크림') || p.slug?.includes('sun-cream');

            if (isTarget) {
                console.log(`\nTARGET DETECTED: ${p.name} | ID: ${p._id}`);

                // 이미지 정리
                const allUrls = [];
                if (p.images) {
                    p.images.forEach(img => { if (img.url) allUrls.push(img.url); });
                }
                if (p.description && p.description.includes('<img')) {
                    const imgRegex = /<img[^>]+src="([^">]+)"/g;
                    let match;
                    while ((match = imgRegex.exec(p.description)) !== null) {
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
                            console.log(`   Storage file skip/error: ${url.substring(0, 40)}...`);
                        }
                    }
                }

                await Product.findByIdAndDelete(p._id);
                console.log(`   Deleted DB document: ${p._id}`);
            }
        }

        console.log('\n✅ Mission accomplished.');
        process.exit(0);
    } catch (err) {
        console.error('Task failed:', err);
        process.exit(1);
    }
}

listAndDelete();
