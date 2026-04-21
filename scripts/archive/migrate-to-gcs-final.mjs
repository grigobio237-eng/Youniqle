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

async function migrateUrls() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({
            $or: [
                { 'images.url': { $regex: 'firebasestorage.googleapis.com' } },
                { 'description': { $regex: 'firebasestorage.googleapis.com' } }
            ]
        });

        console.log(`Found ${products.length} products with old Firebase URLs...`);

        let totalUpdated = 0;
        for (const product of products) {
            let changed = false;

            // 1. 이미지 배열 업데이트
            const updatedImages = product.images.map(img => {
                if (img.url.includes('firebasestorage.googleapis.com')) {
                    // https://firebasestorage.googleapis.com/v0/b/[BUCKET]/o/[PATH]?alt=media... 
                    // -> https://storage.googleapis.com/[BUCKET]/[PATH]
                    const parts = img.url.split('/o/');
                    if (parts.length > 1) {
                        const filePath = decodeURIComponent(parts[1].split('?')[0]);
                        const newUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;
                        console.log(`Updating Image URL: ${img.url} -> ${newUrl}`);
                        changed = true;
                        return { ...img, url: newUrl };
                    }
                }
                return img;
            });

            // 2. 상세 설명 HTML 내 URL 업데이트
            if (product.description && product.description.includes('firebasestorage.googleapis.com')) {
                const regex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/([^?"]+)[\w?=&%-]*/g;
                const newDescription = product.description.replace(regex, (match, match1) => {
                    const filePath = decodeURIComponent(match1);
                    return `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;
                });

                if (newDescription !== product.description) {
                    console.log(`Updating Product Description URLs for ${product._id}`);
                    product.description = newDescription;
                    changed = true;
                }
            }

            if (changed) {
                product.images = updatedImages;
                await product.save();
                totalUpdated++;
            }
        }

        console.log(`✅ Finished! Updated ${totalUpdated} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateUrls();
