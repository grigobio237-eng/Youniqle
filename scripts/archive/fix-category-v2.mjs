import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixCategoryOnly() {
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

        console.log('\n✅ Data normalization finished.');
        process.exit(0);
    } catch (err) {
        console.error('Task failed:', err);
        process.exit(1);
    }
}

fixCategoryOnly();
