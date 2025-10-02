require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkAdminUsers() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 관리자 계정들 확인
    const adminEmails = ['admin@youniqle.com', 'grigobio237@gmail.com'];
    
    console.log('📊 관리자 계정 확인:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const email of adminEmails) {
      const user = await User.findOne({ email });
      
      if (user) {
        console.log(`✅ ${email}`);
        console.log(`   이름: ${user.name}`);
        console.log(`   역할: ${user.role}`);
        console.log(`   이메일 인증: ${user.emailVerified}`);
        console.log(`   생성일: ${user.createdAt}`);
      } else {
        console.log(`❌ ${email} - 계정 없음`);
      }
      console.log('   ─────────────────────────────────────');
    }

    // 모든 관리자 역할 사용자 확인
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 총 ${adminUsers.length}명의 관리자 발견:`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkAdminUsers();
