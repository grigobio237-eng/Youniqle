
const mongoose = require('mongoose');

const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkUserDebug() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();

        // Find the specific user '박수옥 Park Soo ok' or whatever was in the artwork
        // We'll search by username to be sure
        const user = await conn.collection('users').findOne({ username: { $regex: '박수옥' } });

        console.log('--- User Debug ---');
        if (user) {
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('User not found by name regex');
        }

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkUserDebug();
