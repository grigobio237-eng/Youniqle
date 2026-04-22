const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    const user = await User.findOne({ referralCode: 'RFD24F4E' });
    if (user) {
      console.log('User Found by Code RFD24F4E:');
      console.log('Name:', user.name);
      console.log('IsDeleted:', user.isDeleted);
    } else {
      console.log('User NOT found by Code RFD24F4E');
    }

    const allUsers = await User.find({ name: /정달희|Dalhee/i });
    console.log('\nAll users with same name:');
    allUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email}): ${u.referralCode}, isDeleted: ${u.isDeleted}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkUser();
