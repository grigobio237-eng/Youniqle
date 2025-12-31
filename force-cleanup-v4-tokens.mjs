import admin from 'firebase-admin';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(
    readFileSync('./youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json', 'utf8')
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'youniqle-eea2f.firebasestorage.app'
    });
}

const MONGODB_URI = process.env.MONGODB_URI;
const bucket = admin.storage().bucket();

async function recoverWithTokens() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
            name: String,
            images: [{ url: String }],
            description: String
        }));

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process...`);

        for (const product of products) {
            console.log(`Processing product: ${product.name} (${product._id})`);
            let productChanged = false;

            // 1. 이미지 배열 처리
            const updatedImages = [];
            for (const img of product.images) {
                if (img.url.includes('googleapis.com')) {
                    // 주소에서 파일 경로 추출
                    let filePath = '';
                    if (img.url.includes('/o/')) {
                        filePath = decodeURIComponent(img.url.split('/o/')[1].split('?')[0]);
                    } else {
                        filePath = img.url.split(`${bucket.name}/`)[1]?.split('?')[0];
                    }

                    if (filePath) {
                        try {
                            const file = bucket.file(filePath);
                            const [exists] = await file.exists();

                            if (exists) {
                                // 기존 토큰 확인 또는 생성
                                const [metadata] = await file.getMetadata();
                                let token = metadata.metadata?.firebaseStorageDownloadTokens;

                                if (!token) {
                                    token = uuidv4();
                                    await file.setMetadata({
                                        metadata: { firebaseStorageDownloadTokens: token }
                                    });
                                    console.log(`Generated new token for ${filePath}`);
                                }

                                const newTokenizedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
                                updatedImages.push({ ...img, url: newTokenizedUrl });
                                if (img.url !== newTokenizedUrl) productChanged = true;
                            } else {
                                updatedImages.push(img);
                            }
                        } catch (err) {
                            console.error(`Error processing file ${filePath}:`, err.message);
                            updatedImages.push(img);
                        }
                    } else {
                        updatedImages.push(img);
                    }
                } else {
                    updatedImages.push(img);
                }
            }
            product.images = updatedImages;

            // 2. 상세 설명 HTML 내 URL 처리
            if (product.description && (product.description.includes('storage.googleapis.com') || product.description.includes('firebasestorage.googleapis.com'))) {
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                let newDescription = product.description;
                let match;

                console.log(`Analyzing description for ${product._id}...`);

                while ((match = imgRegex.exec(product.description)) !== null) {
                    const oldUrl = match[1];
                    // 기존 URL에서 클린한 파일 경로 추출
                    let oldPath = '';
                    if (oldUrl.includes('/o/')) {
                        oldPath = decodeURIComponent(oldUrl.split('/o/')[1].split('?')[0]);
                    } else if (oldUrl.includes(bucket.name)) {
                        oldPath = oldUrl.split(`${bucket.name}/`)[1]?.split('?')[0];
                    }

                    if (oldPath) {
                        // updatedImages에서 동일한 경로를 가진 신규 URL 찾기
                        const matchedImage = updatedImages.find(ui => {
                            const newUrl = ui.url;
                            const newPath = decodeURIComponent(newUrl.split('/o/')[1].split('?')[0]);
                            return newPath === oldPath;
                        });

                        if (matchedImage) {
                            newDescription = newDescription.replace(oldUrl, matchedImage.url);
                            console.log(`   Replaced in HTML: ${oldPath}`);
                        }
                    }
                }

                // 속성 및 기타 정화 작업
                newDescription = newDescription.replace(/crossOrigin="anonymous"/g, 'crossorigin="anonymous"');

                if (newDescription !== product.description) {
                    product.description = newDescription;
                    productChanged = true;
                }
            }

            if (productChanged) {
                await product.save();
                console.log(`✅ Updated product ${product._id} with tokenized URLs`);
            }
        }

        console.log('🏁 All products recovered with secure tokens!');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error during recovery:', error);
        process.exit(1);
    }
}

recoverWithTokens();
