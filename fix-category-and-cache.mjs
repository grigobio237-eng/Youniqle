import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cache from './src/lib/cache.js';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixCategoryAndCache() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        // 1. 카테고리가 '뷰티'인 상품을 'beauty'로 변경
        const result = await Product.updateMany(
            { category: '뷰티' },
            { $set: { category: 'beauty' } }
        );

        console.log(`Updated ${result.modifiedCount} products category from '뷰티' to 'beauty'.`);

        // 2. 캐시 무효화 (모든 상품 목록 캐시 삭제)
        try {
            // delPattern을 사용하여 모든 products 관련 캐시 삭제
            await cache.delPattern('products:*');
            console.log('Successfully invalidated all products cache.');
        } catch (e) {
            console.error('Cache invalidation failed:', e.message);
        }

        console.log('\n✅ Data normalization and cache cleanup finished.');
        process.exit(0);
    } catch (err) {
        console.error('Task failed:', err);
        process.exit(1);
    }
}

fixCategoryAndCache();
