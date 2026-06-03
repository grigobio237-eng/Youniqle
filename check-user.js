require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const RecoveryScore = mongoose.connection.collection('recoveryscores');
  const User = mongoose.connection.collection('users');

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const leaderboard = await RecoveryScore.aggregate([
      { $match: { date: { $gte: startOfWeekStr } } },
      { $group: {
          _id: '$userId',
          totalWeeklyScore: { $sum: '$totalScore' }
      }},
      { $sort: { totalWeeklyScore: -1 } },
      { $limit: 10 }
  ]).toArray();

  for (const entry of leaderboard) {
      if (entry.totalWeeklyScore === 207) {
          const user = await User.findOne({ _id: new mongoose.Types.ObjectId(entry._id) });
          console.log('User with 207pts:', user ? user.name : 'Unknown', user ? user.email : 'No email');
      }
  }
  
  process.exit(0);
}

check();
