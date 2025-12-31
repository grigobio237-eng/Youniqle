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

        console.log('--- Testing Default Bucket Identification ---');

        const testConfigs = [
            { name: 'No bucket specified', config: { credential: admin.credential.cert(sa) } },
            { name: 'Project ID as bucket', config: { credential: admin.credential.cert(sa), storageBucket: sa.project_id } },
            { name: 'Appspot.com', config: { credential: admin.credential.cert(sa), storageBucket: `${sa.project_id}.appspot.com` } },
            { name: 'Firebasestorage.app', config: { credential: admin.credential.cert(sa), storageBucket: `${sa.project_id}.firebasestorage.app` } }
        ];

        for (const t of testConfigs) {
            console.log(`\nTesting Config: ${t.name}`);
            try {
                // Clear existing apps
                await Promise.all(admin.apps.map(app => app.delete()));

                admin.initializeApp(t.config);
                const bucket = admin.storage().bucket();
                console.log(` - Assigned Bucket Name: ${bucket.name}`);

                const [exists] = await bucket.exists();
                console.log(` - Exists: ${exists}`);

                if (exists) {
                    console.log(`>>> WINNER: ${t.name} (Bucket: ${bucket.name})`);
                }
            } catch (err) {
                console.log(` - FAILED: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('CRITICAL FAILED:', error.message);
    }
}

run();
