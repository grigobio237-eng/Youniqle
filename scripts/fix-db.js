const { MongoClient } = require('mongodb');

// .env.local에서 가져오기 어려우므로 직접 또는 환경변수 활용
const uri = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('youniqle');
        const collection = db.collection('webtoons');

        // 인덱스 목록 확인
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes.map(idx => idx.name));

        // userId_1_date_1 인덱스가 있으면 삭제
        if (indexes.some(idx => idx.name === 'userId_1_date_1')) {
            console.log("Dropping index userId_1_date_1...");
            await collection.dropIndex('userId_1_date_1');
            console.log("Index dropped successfully");
        } else {
            console.log("Index userId_1_date_1 not found");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

run();
