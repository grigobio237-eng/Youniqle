
const mongoose = require('mongoose');

const EXTERNAL_URI = "mongodb+srv://atrsfactory:Yeji753852!!@cluster0.frkdmef.mongodb.net/artsfactory?appName=Cluster0";

async function checkOrders() {
    try {
        const conn = await mongoose.createConnection(EXTERNAL_URI).asPromise();

        // Find a recent order
        const order = await conn.collection('orders').findOne({});

        if (order) {
            console.log('--- Sample Order ---');
            console.dir(order, { depth: null });

            console.log('\n--- Order Keys ---');
            console.log(Object.keys(order).sort().join('\n'));
        } else {
            console.log('No orders found.');
        }

        await conn.close();

    } catch (e) {
        console.error(e);
    }
}

checkOrders();
