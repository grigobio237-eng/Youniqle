import admin from 'firebase-admin';
import { readFileSync } from 'fs';

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

async function setCors() {
    console.log(`Setting CORS for bucket: ${bucket.name}...`);
    try {
        const corsConfiguration = [
            {
                origin: ['*'], // 개발 편의를 위해 전체 허용 (추후 특정 도메인으로 제한 가능)
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
                responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'Authorization', 'X-Requested-With'],
                maxAgeSeconds: 3600
            }
        ];

        await bucket.setCorsConfiguration(corsConfiguration);
        console.log('✅ CORS configuration set successfully! Now images should load in browser without errors.');
    } catch (error) {
        console.error('❌ Failed to set CORS:', error);
    }
}

setCors();
