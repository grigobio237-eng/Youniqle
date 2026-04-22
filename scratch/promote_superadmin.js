const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function promoteSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String
    }));
    
    const email = 'grigobio237@gmail.com';
    const result = await User.findOneAndUpdate(
      { email },
      { role: 'superadmin' },
      { new: true }
    );

    if (result) {
      console.log(`Success: ${email} has been promoted to superadmin.`);
    } else {
      console.log(`Error: User with email ${email} not found.`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
promoteSuperAdmin();
