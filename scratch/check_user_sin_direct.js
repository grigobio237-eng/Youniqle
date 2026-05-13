
const { MongoClient } = require('mongodb');

async function checkUser() {
    const uri = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('youniqle');
        const users = db.collection('users');
        
        const user = await users.findOne({ email: 'sin93101190@gmail.com' });
        console.log('User data:', JSON.stringify(user, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkUser();
