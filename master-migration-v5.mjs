import admin from 'firebase-admin';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

// 1. Firebase 초기화
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

// 2. 이미지 처리 핵심 함수
async function processImageUrl(url, folder = 'migrations') {
    if (!url || typeof url !== 'string') return url;

    // 이미 토큰화된 Firebase URL인 경우 스킵
    if (url.includes('firebasestorage.googleapis.com') && url.includes('token=')) {
        return url;
    }

    try {
        let filePath = '';
        let buffer = null;
        let contentType = 'image/png';

        // CASE 1: 기존 GCS 직접 링크 또는 토큰 없는 Firebase 링크
        if (url.includes('googleapis.com')) {
            if (url.includes('/o/')) {
                filePath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
            } else if (url.includes(bucket.name)) {
                filePath = url.split(`${bucket.name}/`)[1]?.split('?')[0];
            }

            if (filePath) {
                const file = bucket.file(filePath);
                const [exists] = await file.exists();
                if (exists) {
                    const [metadata] = await file.getMetadata();
                    let token = metadata.metadata?.firebaseStorageDownloadTokens;
                    if (!token) {
                        token = uuidv4();
                        await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
                    }
                    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
                }
            }
        }

        // CASE 2: Base64 데이터
        if (url.startsWith('data:image')) {
            const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                contentType = matches[1];
                buffer = Buffer.from(matches[2], 'base64');
                filePath = `${folder}/${uuidv4()}.${contentType.split('/')[1] || 'png'}`;
            }
        }
        // CASE 3: 외부 HTTP/HTTPS URL
        else if (url.startsWith('http')) {
            console.log(`   Downloading external image: ${url.substring(0, 50)}...`);
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
            buffer = Buffer.from(response.data, 'binary');
            contentType = response.headers['content-type'] || 'image/png';
            filePath = `${folder}/${uuidv4()}.${contentType.split('/')[1] || 'png'}`;
        }

        // 업로드 수행
        if (buffer && filePath) {
            const token = uuidv4();
            const file = bucket.file(filePath);
            await file.save(buffer, {
                metadata: {
                    contentType,
                    metadata: { firebaseStorageDownloadTokens: token }
                }
            });
            console.log(`   Uploaded to Firebase: ${filePath}`);
            return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
        }

    } catch (err) {
        console.error(`   Failed to process URL (${url.substring(0, 30)}...):`, err.message);
    }

    return url;
}

// 3. 메인 마이그레이션 함수
async function runMasterMigration() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 모델 정의 (간소화)
        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Review = mongoose.models.Review || mongoose.model('Review', new mongoose.Schema({}, { strict: false }));
        const Content = mongoose.models.Content || mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', new mongoose.Schema({}, { strict: false }));

        // A. Product 마이그레이션
        console.log('\n--- Processing Products ---');
        const products = await Product.find({});
        for (const doc of products) {
            let changed = false;
            // images 배열
            if (doc.images && Array.isArray(doc.images)) {
                for (let i = 0; i < doc.images.length; i++) {
                    const originalUrl = doc.images[i].url;
                    const newUrl = await processImageUrl(originalUrl, 'products');
                    if (originalUrl !== newUrl) {
                        doc.images[i].url = newUrl;
                        changed = true;
                    }
                }
            }
            // description HTML
            if (doc.description && doc.description.includes('<img')) {
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                let newHtml = doc.description;
                let match;
                while ((match = imgRegex.exec(doc.description)) !== null) {
                    const oldSrc = match[1];
                    const newSrc = await processImageUrl(oldSrc, 'products/details');
                    if (oldSrc !== newSrc) {
                        newHtml = newHtml.replace(oldSrc, newSrc);
                        changed = true;
                    }
                }
                newHtml = newHtml.replace(/crossOrigin="anonymous"/g, 'crossorigin="anonymous"');
                if (newHtml !== doc.description) {
                    doc.description = newHtml;
                    changed = true;
                }
            }
            if (changed) {
                doc.markModified('images');
                await doc.save();
                console.log(`   Updated Product: ${doc.name || doc._id}`);
            }
        }

        // B. User 마이그레이션
        console.log('\n--- Processing Users ---');
        const users = await User.find({});
        for (const doc of users) {
            let changed = false;
            if (doc.avatar) {
                const newUrl = await processImageUrl(doc.avatar, 'avatars');
                if (doc.avatar !== newUrl) {
                    doc.avatar = newUrl;
                    changed = true;
                }
            }
            // 파트너 서류
            if (doc.partnerApplication) {
                const img1 = doc.partnerApplication.businessRegistrationImage;
                const img2 = doc.partnerApplication.bankStatementImage;
                if (img1) {
                    const n1 = await processImageUrl(img1, 'partners/documents');
                    if (img1 !== n1) { doc.partnerApplication.businessRegistrationImage = n1; changed = true; }
                }
                if (img2) {
                    const n2 = await processImageUrl(img2, 'partners/documents');
                    if (img2 !== n2) { doc.partnerApplication.bankStatementImage = n2; changed = true; }
                }
            }
            if (changed) {
                await doc.save();
                console.log(`   Updated User: ${doc.email}`);
            }
        }

        // C. Review 마이그레이션
        console.log('\n--- Processing Reviews ---');
        const reviews = await Review.find({});
        for (const doc of reviews) {
            let changed = false;
            if (doc.images && Array.isArray(doc.images)) {
                for (let i = 0; i < doc.images.length; i++) {
                    const orig = doc.images[i];
                    const news = await processImageUrl(orig, 'reviews');
                    if (orig !== news) { doc.images[i] = news; changed = true; }
                }
            }
            if (changed) {
                doc.markModified('images');
                await doc.save();
                console.log(`   Updated Review: ${doc._id}`);
            }
        }

        // D. Content 마이그레이션
        console.log('\n--- Processing Content ---');
        const contents = await Content.find({});
        for (const doc of contents) {
            let changed = false;
            if (doc.thumbnail) {
                const nu = await processImageUrl(doc.thumbnail, 'content/thumbnails');
                if (doc.thumbnail !== nu) { doc.thumbnail = nu; changed = true; }
            }
            if (doc.images && Array.isArray(doc.images)) {
                for (let i = 0; i < doc.images.length; i++) {
                    const orig = doc.images[i];
                    const news = await processImageUrl(orig, 'content/images');
                    if (orig !== news) { doc.images[i] = news; changed = true; }
                }
            }
            if (changed) {
                doc.markModified('images');
                await doc.save();
                console.log(`   Updated Content: ${doc.title}`);
            }
        }

        // E. Order 마이그레이션
        console.log('\n--- Processing Orders ---');
        const orders = await Order.find({});
        for (const doc of orders) {
            let changed = false;
            if (doc.items && Array.isArray(doc.items)) {
                for (let i = 0; i < doc.items.length; i++) {
                    if (doc.items[i].imageUrl) {
                        const nu = await processImageUrl(doc.items[i].imageUrl, 'orders/snapshots');
                        if (doc.items[i].imageUrl !== nu) {
                            doc.items[i].imageUrl = nu;
                            changed = true;
                        }
                    }
                }
            }
            if (changed) {
                doc.markModified('items');
                await doc.save();
                console.log(`   Updated Order: ${doc.orderNumber}`);
            }
        }

        console.log('\n🏁 FATAL MIGRATION COMPLETE!');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Migration Failure:', error);
        process.exit(1);
    }
}

runMasterMigration();
