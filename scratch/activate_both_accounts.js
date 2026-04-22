const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function activateBoth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    // 1. genoetic77 계정 확인 (RFD24F4E 유지)
    const user1 = await User.findOne({ email: 'genoetic77@gmail.com' });
    if (user1) {
      user1.isDeleted = false;
      user1.referralCode = 'RFD24F4E';
      await user1.save();
      console.log('1. genoetic77@gmail.com (RFD24F4E) is ACTIVE');
    }

    // 2. 24rutc 계정 복구 및 새 코드 부여
    const user2 = await User.findOne({ email: '24rutc@gmail.com' });
    if (user2) {
      user2.isDeleted = false;
      // 기존에 썼던 코드가 있다면 복구, 없으면 새로 생성
      if (!user2.referralCode || user2.referralCode.startsWith('RF_OLD_')) {
        const idStr = user2._id.toString();
        user2.referralCode = `RF${idStr.slice(-6).toUpperCase()}`;
      }
      await user2.save();
      console.log(`2. 24rutc@gmail.com (${user2.referralCode}) is ACTIVE`);
    }

    console.log('Both accounts are now active and have unique codes.');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
activateBoth();
