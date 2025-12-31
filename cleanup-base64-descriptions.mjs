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

async function cleanupBase64() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 상세 설명에 base64 데이터가 포함된 상품 찾기
        const products = await Product.find({
            description: { $regex: 'data:image/' }
        });

        console.log(`Found ${products.length} products with Base64 in description.`);

        let totalUpdated = 0;
        for (const product of products) {
            // 이미 product.images에는 스토리지 URL들이 저장되어 있음 (slice(1)이 상세 이미지들)
            const detailUrls = product.images.slice(1).map(img => img.url);

            if (detailUrls.length > 0) {
                const newDescription = detailUrls
                    .map((url, idx) => `<img src="${url}" alt="detail_${idx + 1}" style="max-width: 100%; display: block; margin: 0 auto;" />`)
                    .join('');

                console.log(`Cleaning up Base64 for product: ${product._id}`);
                product.description = newDescription;
                await product.save();
                totalUpdated++;
            }
        }

        console.log(`✅ Finished! Cleaned up ${totalUpdated} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupBase64();
