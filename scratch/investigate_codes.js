const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    const duplicates = await User.aggregate([
      { $group: { _id: "$referralCode", count: { $sum: 1 }, users: { $push: { name: "$name", email: "$email", isDeleted: "$isDeleted" } } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log('Duplicate Referral Codes Found:');
      duplicates.forEach(d => {
        console.log(`\nCode: ${d._id} (Count: ${d.count})`);
        d.users.forEach(u => {
          console.log(`  - ${u.name} (${u.email}), isDeleted: ${u.isDeleted}`);
        });
      });
    } else {
      console.log('No duplicate referral codes found.');
    }

    const deletedWithCodes = await User.find({ isDeleted: true }).select('name email referralCode');
    console.log(`\nDeleted users with codes: ${deletedWithCodes.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkDuplicates();
