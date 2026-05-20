const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('youniqle');

        // Check all collections that might have nudge data
        const collections = await db.listCollections().toArray();
        console.log("\n=== All Collections ===");
        collections.forEach(c => console.log(" -", c.name));

        // Search for nudges with "AI" text
        for (const col of collections) {
            try {
                const docs = await db.collection(col.name).find({
                    $or: [
                        { title: { $regex: 'AI', $options: 'i' } },
                        { message: { $regex: 'AI', $options: 'i' } },
                        { body: { $regex: 'AI', $options: 'i' } },
                        { content: { $regex: 'AI', $options: 'i' } },
                    ]
                }).limit(20).toArray();

                if (docs.length > 0) {
                    console.log(`\n=== [${col.name}] AI 관련 도큐먼트 ${docs.length}건 ===`);
                    docs.forEach(d => {
                        console.log("  ID:", d._id);
                        console.log("  title:", d.title);
                        console.log("  message:", d.message);
                        console.log("  body:", d.body);
                        console.log("  content:", d.content);
                        console.log("  ---");
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
