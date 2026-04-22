const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function backfillCodes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    // 코드가 null이거나 빈 문자열인 유저 조회
    const usersWithoutCode = await User.find({
      $or: [
        { referralCode: null },
        { referralCode: "" },
        { referralCode: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithoutCode.length} users without referral codes.`);

    for (const user of usersWithoutCode) {
      const idStr = user._id.toString();
      const base = idStr.slice(-6).toUpperCase();
      user.referralCode = `RF${base}`;
      
      // 중복 체크 (혹시 모르니)
      const existing = await User.findOne({ referralCode: user.referralCode });
      if (existing) {
        // 중복 시 뒤에 2자리를 더 붙임
        user.referralCode = `RF${idStr.slice(-8).toUpperCase()}`;
      }

      await user.save();
      console.log(`Updated: ${user.name} (${user.email}) -> ${user.referralCode}`);
    }

    console.log('Backfill completed.');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
backfillCodes();
