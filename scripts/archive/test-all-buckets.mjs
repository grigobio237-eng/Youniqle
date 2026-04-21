import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json');

async function run() {
    try {
        const sa = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        if (sa.private_key && sa.private_key.includes('\\n')) {
            sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }

        const candidates = [
            'youniqle-eea2f.firebasestorage.app',
            'youniqle-eea2f.appspot.com',
            'youniqle-eea2f.asia-northeast3.firebasestorage.app',
            'youniqle-eea2f.asia-northeast3.appspot.com',
            'youniqle-eea2f'
        ];

        console.log('--- Testing Bucket Candidates ---');
        for (const bName of candidates) {
            try {
                // 매번 새로 초기화할 수 없으니 앱이 없는 경우에만 초기화하거나, 매번 앱 이름을 다르게?
                // 여기서는 그냥 admin.storage().bucket(name)으로 테스트
                if (admin.apps.length === 0) {
                    admin.initializeApp({
                        credential: admin.credential.cert(sa)
                    });
                }

                const bucket = admin.storage().bucket(bName);
                console.log(`Checking [${bName}]...`);
                // exists() 대신 metadata()를 가져와봄 (더 상세한 정보)
                try {
                    const [metadata] = await bucket.getMetadata();
                    console.log(`>>> SUCCESS! Bucket [${bName}] exists. Project: ${metadata.projectNumber}`);
                    return; // 찾았으니 종료
                } catch (metaErr) {
                    console.log(` - Metadata check failed for [${bName}]: ${metaErr.message}`);
                }
            } catch (err) {
                console.log(` - Error for [${bName}]: ${err.message}`);
            }
        }

        console.log('All candidates failed.');

    } catch (error) {
        console.error('CRITICAL FAILED:', error.message);
    }
}

run();
