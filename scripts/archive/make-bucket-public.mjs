import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

// 서비스 계정 키 로드
const serviceAccount = JSON.parse(
    readFileSync('./youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json', 'utf8')
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'youniqle-eea2f.firebasestorage.app'
    });
}

const bucket = admin.storage().bucket();

async function makeBucketPublic() {
    console.log(`Starting to make bucket public: ${bucket.name}...`);
    try {
        // 버킷 자체를 공개로 설정 (기본적으로 fine-grained access 제어)
        // allUsers에게 Storage Object Viewer 권한 부여
        await bucket.makePublic();
        console.log('✅ Bucket is now public! All objects can be accessed via their media link without tokens.');

        // 기존 파일들도 명시적으로 공개화 테스트 (선택 사항이나 권장)
        const [files] = await bucket.getFiles({ prefix: 'products/' });
        console.log(`Found ${files.length} files in products/ folder. Making them public...`);

        for (const file of files) {
            await file.makePublic();
        }
        console.log('✅ All existing product images are now public.');

    } catch (error) {
        console.error('❌ Failed to make bucket public:', error);
    }
}

makeBucketPublic();
