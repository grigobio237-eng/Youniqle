const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String
    }));
    
    const user = await User.findOne({ name: /정달희|Dalhee/i });
    if (user) {
      console.log('User Found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('ReferralCode:', user.referralCode);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkUser();
