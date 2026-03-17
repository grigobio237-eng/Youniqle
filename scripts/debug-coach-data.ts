
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkCoachData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    
    const coaches = await User.find({
      partnerStatus: 'approved',
      'partnerApplication.partnerType': 'coach'
    });

    console.log(`Found ${coaches.length} coaches`);

    coaches.forEach(coach => {
      console.log('--- Coach:', coach.name, '---');
      console.log('Email:', coach.email);
      console.log('PavilionInfo:', JSON.stringify(coach.pavilionInfo, null, 2));
      console.log('CoachProfile:', JSON.stringify(coach.coachProfile, null, 2));
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCoachData();
