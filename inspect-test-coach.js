const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({ email: String }, { strict: false }));
    const user = await User.findOne({ email: 'coach-test@youniqle.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('--- COACH PROFILE ---');
    console.log(JSON.stringify(user.coachProfile || {}, null, 2));
    
    console.log('--- AVAILABILITY ---');
    console.log(JSON.stringify(user.coachProfile?.availability || [], null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
