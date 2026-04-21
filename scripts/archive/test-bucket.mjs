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

        console.log('--- Listing All Buckets ---');
        const [buckets] = await admin.storage().getBuckets();
        console.log(`Found ${buckets.length} buckets:`);
        buckets.forEach(b => console.log(' - ' + b.name));

        if (buckets.length > 0) {
            console.log(`>>> FIRST BUCKET: ${buckets[0].name}`);
        } else {
            console.log('No buckets found in this project.');
        }

    } catch (error) {
        console.error('FAILED:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

run();
