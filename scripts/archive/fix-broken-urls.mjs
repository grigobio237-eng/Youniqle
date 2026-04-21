import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixBrokenUrls() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI가 설정되지 않았습니다.');

        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
            name: String,
            description: String,
            images: Array
        }, { strict: false }));

        // 정규식: ? 매개변수가 이미 있는데 또 ?v=1이 붙은 경우 찾기
        // 예: ...?alt=media&token=xxx?v=1 -> ...?alt=media&token=xxx&v=1
        const products = await Product.find({
            $or: [
                { description: { $regex: /\?.*?\?v=1/ } },
                { "images.url": { $regex: /\?.*?\?v=1/ } }
            ]
        });

        console.log(`Found ${products.length} products with broken URLs.`);

        for (const product of products) {
            let updated = false;

            // 1. 상세 설명(HTML) 내 URL 복구
            if (product.description && product.description.includes('?v=1')) {
                // 첫 번째 ? 이후에 나오는 모든 ?v=1을 &v=1로 변경
                const parts = product.description.split('?v=1');
                if (parts.length > 1) {
                    let newDescription = parts[0];
                    for (let i = 1; i < parts.length; i++) {
                        // 이전 문자열에 ?가 포함되어 있다면 이번 결합은 &로
                        const separator = newDescription.includes('?') ? '&' : '?';
                        newDescription += separator + 'v=1' + parts[i];
                    }
                    if (newDescription !== product.description) {
                        product.description = newDescription;
                        updated = true;
                    }
                }
            }

            // 2. 이미지 배열 내 URL 복구
            if (product.images && product.images.length > 0) {
                const newImages = product.images.map(img => {
                    if (img.url && img.url.includes('?v=1')) {
                        const parts = img.url.split('?v=1');
                        if (parts.length > 1) {
                            let newUrl = parts[0];
                            for (let i = 1; i < parts.length; i++) {
                                const separator = newUrl.includes('?') ? '&' : '?';
                                newUrl += separator + 'v=1' + parts[i];
                            }
                            if (newUrl !== img.url) {
                                updated = true;
                                return { ...img, url: newUrl };
                            }
                        }
                    }
                    return img;
                });
                if (updated) {
                    product.images = newImages;
                }
            }

            if (updated) {
                await product.save();
                console.log(`✅ Fixed URLs for product: ${product.name}`);
            }
        }

        console.log('\n🚀 URL restoration finished.');
        process.exit(0);
    } catch (err) {
        console.error('Task failed:', err);
        process.exit(1);
    }
}

fixBrokenUrls();
