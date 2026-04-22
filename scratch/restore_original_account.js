const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function restoreGenoetic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    // 1. 현재 RFD24F4E를 가지고 있는 빈 계정(24rutc)의 코드를 변경
    const activeEmptyUser = await User.findOne({ email: '24rutc@gmail.com' });
    if (activeEmptyUser) {
      activeEmptyUser.referralCode = `RF_OLD_${Date.now().toString().slice(-4)}`;
      activeEmptyUser.isDeleted = true; // 중복 계정이므로 삭제 처리 권장
      await activeEmptyUser.save();
      console.log('1. Moved RFD24F4E away from 24rutc@gmail.com');
    }

    // 2. 원본 계정(genoetic77) 복구 및 코드 할당
    const originalUser = await User.findOne({ email: 'genoetic77@gmail.com' });
    if (originalUser) {
      originalUser.isDeleted = false;
      originalUser.referralCode = 'RFD24F4E';
      await originalUser.save();
      console.log('2. Restored genoetic77@gmail.com with code RFD24F4E');
    }

    console.log('Final Verification:');
    const final1 = await User.findOne({ email: 'genoetic77@gmail.com' });
    console.log(`- ${final1.email}: Code=${final1.referralCode}, IsDeleted=${final1.isDeleted}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
restoreGenoetic();
