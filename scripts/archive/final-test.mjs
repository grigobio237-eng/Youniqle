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
            credential: admin.credential.cert(sa),
            storageBucket: 'youniqle-eea2f.firebasestorage.app'
        });

        console.log('--- Final Upload Test ---');
        const bucket = admin.storage().bucket();
        console.log(`Using bucket: ${bucket.name}`);

        const testFile = bucket.file('final-verification.txt');
        await testFile.save('Verification success at ' + new Date().toISOString(), {
            metadata: { contentType: 'text/plain' }
        });

        console.log('>>> SUCCESS! File uploaded successfully.');

        // Cleanup
        await testFile.delete();
        console.log('>>> SUCCESS! File deleted successfully.');

    } catch (error) {
        console.error('FAILED:', error.message);
        if (error.response) console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
}

run();
