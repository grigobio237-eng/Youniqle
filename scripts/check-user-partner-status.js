const mongoose = require('mongoose');
require('dotenv').config();

// User 모델 정의 (간단한 버전)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  partnerStatus: String,
  partnerApplication: {
    businessName: String,
    businessNumber: String,
    businessAddress: String,
    businessPhone: String,
    businessDescription: String,
    bankAccount: String,
    bankName: String,
    accountHolder: String
  },
  partnerSettings: {
    commissionRate: Number,
    notificationEmail: String,
    notificationPhone: String,
    autoApproval: Boolean
  }
});

const User = mongoose.model('User', userSchema);

async function checkUserPartnerStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 신연수 계정 찾기
    const user = await User.findOne({ email: 'sin93101190@gmail.com' });
    
    if (user) {
      console.log('=== 사용자 정보 ===');
      console.log('이름:', user.name);
      console.log('이메일:', user.email);
      console.log('파트너 상태:', user.partnerStatus);
      console.log('사업자명:', user.partnerApplication?.businessName);
      console.log('수수료율:', user.partnerSettings?.commissionRate);
      
      if (user.partnerStatus === 'approved') {
        console.log('✅ 파트너 승인됨');
      } else {
        console.log('❌ 파트너 승인되지 않음');
        console.log('현재 상태:', user.partnerStatus);
      }
    } else {
      console.log('❌ 사용자를 찾을 수 없습니다.');
    }

    // 모든 파트너 상태 사용자 확인
    console.log('\n=== 모든 파트너 상태 사용자 ===');
    const allUsers = await User.find({}, 'name email partnerStatus');
    allUsers.forEach(user => {
      console.log(`${user.name} (${user.email}) - ${user.partnerStatus}`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

checkUserPartnerStatus();
