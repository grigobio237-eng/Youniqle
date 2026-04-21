import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// .env.local 로드
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// 스키마 정의 (최소화)
const ProductSchema = new mongoose.Schema({
    images: [{ url: String }]
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function fixUrls() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ 'images.url': { $regex: 'firebasestorage.googleapis.com' } });
        console.log(`Found ${products.length} products to check...`);

        let updateCount = 0;
        for (const product of products) {
            let changed = false;
            const updatedImages = product.images.map(img => {
                if (img.url.includes('firebasestorage.googleapis.com') && !img.url.includes('token=')) {
                    // 토큰이 없는 URL을 발견하면 정규화 (버킷이 공개되었으므로 토큰 없이 alt=media만 있으면 됨)
                    // 가끔 도메인 문제로 인해 storage.googleapis.com으로 변경해 보는 것도 방법
                    console.log(`Fixing URL for product ${product._id}: ${img.url}`);
                    changed = true;
                    return { ...img, url: img.url.split('&token=')[0] }; // 혹시 모를 깨진 토큰 제거
                }
                return img;
            });

            if (changed) {
                product.images = updatedImages;
                await product.save();
                updateCount++;
            }
        }

        console.log(`✅ Successfully updated ${updateCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing URLs:', error);
        process.exit(1);
    }
}

fixUrls();
