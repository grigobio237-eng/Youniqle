import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json');

async function run() {
    try {
        const sa = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        if (sa.private_key && sa.private_key.includes('\\n')) {
            sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }

        const storage = new Storage({
            projectId: sa.project_id,
            credentials: {
                client_email: sa.client_email,
                private_key: sa.private_key
            }
        });

        console.log('--- Listing All Buckets (Direct GCS) ---');
        const [buckets] = await storage.getBuckets();
        console.log(`Found ${buckets.length} buckets:`);
        buckets.forEach(b => console.log(' - ' + b.name));

        if (buckets.length > 0) {
            console.log(`>>> VALID BUCKET NAME: ${buckets[0].name}`);
        } else {
            console.log('No buckets found or no permission.');
        }

    } catch (error) {
        console.error('FAILED:', error.message);
    }
}

run();
