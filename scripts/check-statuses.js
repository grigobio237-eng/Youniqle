
const mongoose = require('mongoose');

const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkStatuses() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();

        const statuses = await conn.collection('artworks').distinct('status');
        console.log('Unique Layout Statuses:', statuses);

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkStatuses();
