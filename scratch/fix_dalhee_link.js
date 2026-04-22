const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixDalhee() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      referralCode: String,
      isDeleted: Boolean
    }));
    
    // 1. 삭제된 계정의 코드를 무력화 (중복 방지)
    const deletedUser = await User.findOne({ email: 'genoetic77@gmail.com', isDeleted: true });
    if (deletedUser) {
      deletedUser.referralCode = `DEL_${deletedUser.referralCode}_${Date.now()}`;
      await deletedUser.save();
      console.log('1. Invalidated deleted account code.');
    }

    // 2. 활성 계정의 코드를 RFD24F4E로 변경 (기존 링크 활성화)
    const activeUser = await User.findOne({ email: '24rutc@gmail.com', isDeleted: false });
    if (activeUser) {
      activeUser.referralCode = 'RFD24F4E';
      await activeUser.save();
      console.log('2. Transferred RFD24F4E to active account (24rutc@gmail.com).');
    }

    console.log('Fix completed. The shared link should work now.');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
fixDalhee();
