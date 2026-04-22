const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkCode() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    const user = await User.findOne({ referralCode: 'RF0BA714' });
    if (user) {
      console.log('User Found by Code RF0BA714:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('IsDeleted:', user.isDeleted);
    } else {
      console.log('User NOT found by Code RF0BA714');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkCode();
