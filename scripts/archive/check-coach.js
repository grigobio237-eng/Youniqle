const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function checkCoach() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const coach = await User.findOne({ email: 'coach-test@youniqle.com' });
    if (coach) {
      console.log('Coach found:', JSON.stringify({
        email: coach.email,
        partnerStatus: coach.partnerStatus,
        partnerType: coach.partnerApplication?.partnerType,
        coachProfile: coach.coachProfile
      }, null, 2));
    } else {
      console.log('Coach not found.');
    }

    const approvedCoaches = await User.find({
      partnerStatus: 'approved',
      'partnerApplication.partnerType': 'coach'
    });
    console.log('Number of approved coaches:', approvedCoaches.length);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkCoach();
