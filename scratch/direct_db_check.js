const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";

async function checkUserStats(email) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const users = db.collection('users');
        const recoveryScores = db.collection('recoveryscores');

        const user = await users.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }

        const totalLogs = await recoveryScores.countDocuments({ userId: user._id });
        console.log(`User ID: ${user._id}`);
        console.log(`Total RecoveryScore logs: ${totalLogs}`);
        console.log(`Issued Certificates: ${JSON.stringify(user.issuedCertificates || [], null, 2)}`);
        
        const logs = await recoveryScores.find({ userId: user._id }).sort({ date: 1 }).toArray();
        console.log(`First 5 log dates: ${logs.slice(0, 5).map(l => l.date).join(', ')}`);
        console.log(`Last 5 log dates: ${logs.slice(-5).map(l => l.date).join(', ')}`);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUserStats('grigobio237@gmail.com');
