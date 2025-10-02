require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function checkUserGrades() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    const users = await User.find({}, 'name email grade role');
    
    console.log('\n📊 사용자 등급 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   역할: ${user.role}`);
      console.log(`   등급: ${user.grade || 'N/A'}`);
      console.log('   ─────────────────────────────────────');
    });

    // 등급별 통계
    const gradeStats = {};
    users.forEach(user => {
      const grade = user.grade || 'undefined';
      gradeStats[grade] = (gradeStats[grade] || 0) + 1;
    });

    console.log('\n📈 등급별 통계:');
    Object.entries(gradeStats).forEach(([grade, count]) => {
      console.log(`   ${grade}: ${count}명`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkUserGrades();
