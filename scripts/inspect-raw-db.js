
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(); // Use default db from URI
        const collection = db.collection('videoprojects');

        const projectId = '699eb8acd04cfe0d3bd0684f';
        const project = await collection.findOne({ _id: new ObjectId(projectId) });

        if (!project) {
            console.log('Project not found with ObjectId');
            // Try string search just in case
            const p2 = await collection.findOne({ _id: projectId });
            if (p2) console.log('Found with string ID');
            else {
                console.log('Listing some IDs:');
                const some = await collection.find({}).limit(5).toArray();
                some.forEach(s => console.log(s._id));
                return;
            }
        }

        console.log('Project:', JSON.stringify(project, null, 2));
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
