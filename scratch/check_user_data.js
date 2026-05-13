import dbConnect from './src/lib/db';
import User from './src/models/User';
import RecoveryScore from './src/models/RecoveryScore';

async function checkUserStats(email) {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
        console.log('User not found');
        return;
    }

    const totalLogs = await RecoveryScore.countDocuments({ userId: user._id });
    console.log(`User: ${email}`);
    console.log(`Total RecoveryScore logs: ${totalLogs}`);
    console.log(`Issued Certificates: ${JSON.stringify(user.issuedCertificates, null, 2)}`);
    
    const logs = await RecoveryScore.find({ userId: user._id }).sort({ date: 1 });
    console.log(`Log dates: ${logs.map(l => l.date).join(', ')}`);
}

checkUserStats('grigobio237@gmail.com')
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
