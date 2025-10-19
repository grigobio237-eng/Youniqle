// MongoDB 연결 테스트 스크립트
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testMongoDBConnection() {
  try {
    console.log('🗄️ MongoDB 연결 테스트 시작...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? '설정됨' : '설정되지 않음');
    
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: true,
    });
    
    console.log('✅ MongoDB 연결 성공');
    
    // 데이터베이스 상태 확인
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    // 서버 상태 확인
    const serverStatus = await admin.serverStatus();
    console.log('📊 MongoDB 서버 상태:');
    console.log(`  - 버전: ${serverStatus.version}`);
    console.log(`  - 업타임: ${Math.floor(serverStatus.uptime / 60)}분`);
    console.log(`  - 연결 수: ${serverStatus.connections.current}`);
    
    // 데이터베이스 목록 확인
    const databases = await admin.listDatabases();
    console.log('📁 사용 가능한 데이터베이스:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // 컬렉션 확인
    const collections = await db.listCollections().toArray();
    console.log('📋 현재 데이터베이스의 컬렉션:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // 샘플 데이터 확인
    const userCount = await db.collection('users').countDocuments();
    const productCount = await db.collection('products').countDocuments();
    const orderCount = await db.collection('orders').countDocuments();
    
    console.log('📈 데이터 현황:');
    console.log(`  - 사용자: ${userCount}명`);
    console.log(`  - 상품: ${productCount}개`);
    console.log(`  - 주문: ${orderCount}개`);
    
    console.log('✅ MongoDB 테스트 완료');
    
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

testMongoDBConnection();













