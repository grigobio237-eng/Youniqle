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

async function forceCleanupV2() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const targetName = '그리고프리미엄썬크림';
        // 정규식으로 더 넓게 검색
        const products = await Product.find({
            $or: [
                { name: { $regex: targetName, $options: 'i' } },
                { slug: { $regex: 'sunny-sun-cream', $options: 'i' } }
            ]
        });

        console.log(`Found ${products.length} products to delete.`);

        for (const product of products) {
            console.log(`\n--- DELETING: ${product.name} (${product._id}) ---`);

            // 1. 이미지 및 상세이미지 정리
            const allUrls = [];
            if (product.images) {
                product.images.forEach(img => { if (img.url) allUrls.push(img.url); });
            }

            // HTML 본문 이미지 추출
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

            // 2. DB 삭제
            await Product.findByIdAndDelete(product._id);
            console.log(`   Deleted from DB: ${product._id}`);
        }

        console.log('\n✅ All targeted products and files have been removed.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

forceCleanupV2();
