
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkCoachData() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is missing');
      return;
    }
    console.log('Connecting to:', process.env.MONGODB_URI.substring(0, 20) + '...');
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
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCoachData();
