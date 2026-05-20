const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('youniqle');

        // Look for nudges specifically
        const collections = await db.listCollections().toArray();
        const colNames = collections.map(c => c.name);
        console.log("Collections:", colNames.join(', '));

        // Try common nudge collection names
        const nudgeCols = colNames.filter(n => n.includes('nudge') || n.includes('notification') || n.includes('push') || n.includes('alert') || n.includes('card'));
        console.log("Nudge-like collections:", nudgeCols);

        // Search all collections for "5분 이완"
        for (const col of colNames) {
            try {
                const docs = await db.collection(col).find({
                    $or: [
                        { title: { $regex: '5분', $options: 'i' } },
                        { message: { $regex: '5분', $options: 'i' } },
                        { body: { $regex: '5분', $options: 'i' } },
                    ]
                }).limit(10).toArray();

                if (docs.length > 0) {
                    console.log(`\n=== [${col}] "5분" 관련 ===`);
                    docs.forEach(d => {
                        console.log(JSON.stringify(d, null, 2));
                    });
                }
            } catch(e) {}
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
