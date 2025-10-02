require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkBothDatabases() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    
    // 현재 연결된 데이터베이스 확인
    const currentUri = process.env.MONGODB_URI;
    console.log('📍 현재 MONGODB_URI:', currentUri);
    
    await mongoose.connect(currentUri);
    console.log('✅ MongoDB 연결 성공');
    
    const currentDb = mongoose.connection.db.databaseName;
    console.log('📊 현재 연결된 데이터베이스:', currentDb);
    
    // 현재 데이터베이스의 사용자 확인
    console.log('\n📋 현재 데이터베이스 사용자:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const currentUsers = await User.find({});
    console.log(`총 ${currentUsers.length}명의 사용자:`);
    currentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   이름: ${user.name}`);
      console.log(`   역할: ${user.role}`);
      console.log(`   파트너 상태: ${user.partnerStatus || 'N/A'}`);
      console.log(`   생성일: ${user.createdAt}`);
      console.log('   ─────────────────────────────────────');
    });
    
    // youniqle 데이터베이스로 전환하여 확인
    console.log('\n🔄 youniqle 데이터베이스 확인...');
    
    // youniqle 데이터베이스 URI 생성
    const youniqleUri = currentUri.replace(/\/[^\/]+$/, '/youniqle');
    console.log('📍 youniqle URI:', youniqleUri);
    
    // 별도 연결로 youniqle 데이터베이스 확인
    const youniqleConnection = mongoose.createConnection(youniqleUri);
    const YouniqleUser = youniqleConnection.model('User', User.schema);
    
    const youniqleUsers = await YouniqleUser.find({});
    console.log(`\n📋 youniqle 데이터베이스 사용자 (${youniqleUsers.length}명):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    youniqleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   이름: ${user.name}`);
      console.log(`   역할: ${user.role}`);
      console.log(`   파트너 상태: ${user.partnerStatus || 'N/A'}`);
      console.log(`   생성일: ${user.createdAt}`);
      console.log('   ─────────────────────────────────────');
    });
    
    await youniqleConnection.close();
    
    console.log('\n📊 데이터베이스 비교 결과:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`현재 데이터베이스 (${currentDb}): ${currentUsers.length}명`);
    console.log(`youniqle 데이터베이스: ${youniqleUsers.length}명`);
    console.log('\n💡 권장사항:');
    console.log('- 모든 데이터를 youniqle 데이터베이스로 통합하는 것을 권장합니다.');
    console.log('- MONGODB_URI를 youniqle 데이터베이스로 변경하세요.');

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkBothDatabases();
