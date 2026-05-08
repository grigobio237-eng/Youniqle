
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const User = require('../src/models/User').default;
const RecoveryScore = require('../src/models/RecoveryScore').default;

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const email = 'grigobio237@gmail.com';
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }

  console.log('User found:', user.name);
  console.log('Issued Certificates Count:', user.issuedCertificates?.length || 0);
  console.log('Issued Certificates:', JSON.stringify(user.issuedCertificates, null, 2));

  const scoresCount = await RecoveryScore.countDocuments({ userId: user._id });
  console.log('Total Recovery Scores:', scoresCount);

  const scores = await RecoveryScore.find({ userId: user._id }).sort({ date: 1 });
  console.log('Scores dates:', scores.map(s => s.date.toISOString().split('T')[0]));

  const claimedCycles = user.issuedCertificates?.length || 0;
  const skipCount = claimedCycles * 7;
  console.log('Skip Count:', skipCount);

  const currentCycleScores = await RecoveryScore.find({ userId: user._id })
    .sort({ date: 1 })
    .skip(skipCount)
    .limit(7);
  
  console.log('Current Cycle Scores Count:', currentCycleScores.length);
  console.log('Current Cycle Scores dates:', currentCycleScores.map(s => s.date.toISOString().split('T')[0]));

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
