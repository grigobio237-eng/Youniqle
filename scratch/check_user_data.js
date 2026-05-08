require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ email: 'grigobio237@gmail.com' });
    
    if(!user) {
        console.log('User not found');
        process.exit(0);
    }
    
    console.log('User ID:', user._id);
    console.log('User ID type:', typeof user._id);
    
    const collections = await db.listCollections().toArray();
    console.log('All collections:', collections.map(c => c.name).join(', '));
    
    for(const col of collections) {
        try {
            // userId로 조회
            let count = await db.collection(col.name).countDocuments({ userId: user._id });
            // string 타입의 userId로도 혹시 저장되었는지 확인
            let countStr = await db.collection(col.name).countDocuments({ userId: user._id.toString() });
            
            if(count > 0 || countStr > 0) {
                const latest = await db.collection(col.name).find({ $or: [{userId: user._id}, {userId: user._id.toString()}] }).sort({ createdAt: -1 }).limit(1).toArray();
                const latestDate = latest[0]?.createdAt || latest[0]?.timestamp || latest[0]?.date || 'Unknown';
                console.log(`[${col.name}] Count: ${count + countStr}, Latest: ${latestDate}`);
            }
        } catch(e){
            // ignore
        }
    }
    
    process.exit(0);
}).catch(console.error);
