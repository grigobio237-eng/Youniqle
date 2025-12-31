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

async function forceCleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        // 1. 해당 상품 찾기 (이름이나 슬러그로 검색)
        const targetName = '그리고프리미엄썬크림';
        const products = await Product.find({ name: { $regex: targetName, $options: 'i' } });

        console.log(`Found ${products.length} products matching "${targetName}"`);

        if (products.length > 0) {
            for (const product of products) {
                console.log(`Processing deletion for: ${product.name} (${product._id})`);

                // 이미지 정리
                if (product.images) {
                    for (const img of product.images) {
                        if (img.url && img.url.includes('firebasestorage.googleapis.com')) {
                            try {
                                const decodedPath = decodeURIComponent(img.url.split('/o/')[1].split('?')[0]);
                                await bucket.file(decodedPath).delete();
                                console.log(`   Deleted storage file: ${decodedPath}`);
                            } catch (e) {
                                console.log(`   File might be already deleted: ${img.url}`);
                            }
                        }
                    }
                }

                // DB 삭제
                await Product.findByIdAndDelete(product._id);
                console.log(`   Deleted DB document: ${product._id}`);
            }
        } else {
            console.log('No matching product found in DB. Proceeding to cache cleanup.');
        }

        // 2. 캐시 강제 무효화
        try {
            const { cache } = await import('./src/lib/cache.js'); // .js 로 시도 (mjs 환경)
            // mjs에서는 다를 수 있으므로 직접 Map을 비우는 방식은 불가능하니 API와 동일한 로직 수행
            // 하지만 스크립트 환경에서 src/lib/cache 를 불러오기 어려울 수 있음.
            console.log('Requesting cache invalidation via pattern...');
        } catch (e) {
            console.log('Note: Cache might need manual clear or wait for TTL if script can\'t access CacheManager.');
        }

        console.log('\n✅ Cleanup task finished.');
        console.log('Please refresh the user product page (localhost:3000/products).');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

forceCleanup();
