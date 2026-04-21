import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const BUCKET_NAME = 'youniqle-eea2f.firebasestorage.app';

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

const ProductSchema = new mongoose.Schema({
    images: [{ url: String }],
    description: String
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function forceCleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 특정 ID 상품 또는 base64 데이터가 포함된 모든 상품 대상
        const products = await Product.find({
            $or: [
                { _id: '695492f85b5fadb506baf4d2' },
                { description: { $regex: 'data:image/' } }
            ]
        });

        console.log(`Found ${products.length} products to forcefully cleanup...`);

        for (const product of products) {
            console.log(`Cleaning up product: ${product._id} (${product.name || 'Unknown Name'})`);

            // 1. 이미 product.images에는 스토리지 URL들이 저장되어 있음 (slice(1)이 상세 이미지들)
            // 만약 썸네일만 있고 상세이미지가 없다면 images[0]을 사용하거나 images 전체를 사용
            const imageUrls = product.images.map(img => img.url);

            if (imageUrls.length > 0) {
                // 첫번째(썸네일)를 제외한 나머지가 상세 이미지라고 가정 (AI 빌더 로직 기준)
                const detailedUrls = imageUrls.length > 1 ? imageUrls.slice(1) : imageUrls;

                const newDescription = detailedUrls
                    .map((url, idx) => `<img src="${url}" alt="detail_${idx + 1}" crossorigin="anonymous" style="max-width: 100%; display: block; margin: 0 auto;" />`)
                    .join('');

                product.description = newDescription;
                await product.save();
                console.log(`✅ Successfully cleaned up description for ${product._id}`);
            } else {
                console.log(`⚠️ No images found for product ${product._id}, skip description fix.`);
            }
        }

        console.log(`🏁 All cleanup tasks done!`);
        process.exit(0);
    } catch (error) {
        console.error('Force cleanup failed:', error);
        process.exit(1);
    }
}

forceCleanup();
