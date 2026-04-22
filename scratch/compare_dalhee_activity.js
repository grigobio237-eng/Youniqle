const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDiagnoses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean,
      diagnosisResults: Array
    }));
    
    const users = await User.find({ name: /정달희|Dalhee/i });
    console.log('User Comparison:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email})`);
      console.log(`  Code: ${u.referralCode}`);
      console.log(`  IsDeleted: ${u.isDeleted}`);
      console.log(`  Diagnoses: ${u.diagnosisResults?.length || 0}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkDiagnoses();
