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

        admin.initializeApp({
            credential: admin.credential.cert(sa)
        });

        const candidates = [
            'youniqle-eea2f.firebasestorage.app',
            'youniqle-eea2f.appspot.com',
            'youniqle-eea2f'
        ];

        console.log('--- Force Write Test ---');
        for (const bName of candidates) {
            console.log(`Testing [${bName}]...`);
            try {
                const bucket = admin.storage().bucket(bName);
                const testFile = bucket.file('write-test.txt');
                await testFile.save('Test write at ' + new Date().toISOString());
                console.log(`>>> SUCCESS! Wrote to [${bName}]`);
                return; // 성공하면 종료
            } catch (err) {
                console.log(` - Write failed for [${bName}]: ${err.message}`);
                // 만약 403이면 권한 문제, 404면 존재하지 않음
            }
        }

        console.log('All write tests failed.');

    } catch (error) {
        console.error('CRITICAL FAILED:', error.message);
    }
}

run();
