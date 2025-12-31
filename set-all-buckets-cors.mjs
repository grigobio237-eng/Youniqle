import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
    readFileSync('./youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json', 'utf8')
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const knownBuckets = [
    'youniqle-eea2f.firebasestorage.app',
    'youniqle-eea2f.appspot.com'
];

async function setCorsForKnownBuckets() {
    try {
        const corsConfiguration = [
            {
                origin: ['*'],
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
                responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'Authorization', 'X-Requested-With', 'Range'],
                maxAgeSeconds: 3600
            }
        ];

        for (const bucketName of knownBuckets) {
            console.log(`Applying CORS to bucket: ${bucketName}...`);
            const bucket = admin.storage().bucket(bucketName);
            await bucket.setCorsConfiguration(corsConfiguration);
            console.log(`✅ Success for ${bucketName}`);
        }

        console.log('🏁 Known buckets are now CORS-enabled!');
    } catch (error) {
        console.error('❌ Failed to set CORS:', error);
    }
}

setCorsForKnownBuckets();
