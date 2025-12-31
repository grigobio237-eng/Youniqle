import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

const ProductSchema = new mongoose.Schema({
    images: [{ url: String }],
    description: String
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function forceCleanupV3() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 모든 상품 대상 (캐시 버스터 적용 및 속성 통일)
        const products = await Product.find({
            $or: [
                { description: { $regex: 'storage.googleapis.com' } },
                { description: { $regex: 'firebasestorage.googleapis.com' } }
            ]
        });

        console.log(`Found ${products.length} products to apply cache buster...`);

        for (const product of products) {
            console.log(`Updating product: ${product._id}`);

            const imageUrls = product.images.map(img => img.url);

            if (imageUrls.length > 0) {
                const detailedUrls = imageUrls.length > 1 ? imageUrls.slice(1) : imageUrls;

                // ?v=1 캐시 버스터 주입 및 crossorigin(소문자) 통일
                const newDescription = detailedUrls
                    .map((url, idx) => `<img src="${url}?v=1" alt="detail_${idx + 1}" crossorigin="anonymous" style="max-width: 100%; display: block; margin: 0 auto;" />`)
                    .join('');

                product.description = newDescription;
                await product.save();
                console.log(`✅ Cache buster applied for ${product._id}`);
            }
        }

        console.log(`🏁 All cache buster tasks completed!`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup V3 failed:', error);
        process.exit(1);
    }
}

forceCleanupV3();
