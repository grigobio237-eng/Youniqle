require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('🔗 MongoDB 연결 테스트 시작...');
    console.log('📍 연결 URL:', process.env.MONGODB_URI ? '설정됨' : '❌ 설정되지 않음');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });

    console.log('✅ MongoDB 연결 성공!');
    
    // 데이터베이스 정보 확인
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 연결된 데이터베이스: ${dbName}`);
    
    // 컬렉션 목록 조회
    const collections = await db.listCollections().toArray();
    console.log(`📁 기존 컬렉션 (${collections.length}개):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // 간단한 테스트 데이터 삽입/조회/삭제
    console.log('\n🧪 데이터베이스 작업 테스트...');
    
    const testCollection = db.collection('connection_test');
    
    // 테스트 문서 삽입
    const testDoc = {
      message: 'MongoDB 연결 테스트',
      timestamp: new Date(),
      status: 'success'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ 문서 삽입 성공:', insertResult.insertedId);
    
    // 테스트 문서 조회
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ 문서 조회 성공:', foundDoc.message);
    
    // 테스트 문서 삭제
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ 문서 삭제 성공:', deleteResult.deletedCount, '개');
    
    console.log('\n🎉 MongoDB 연결 및 기본 작업 테스트 완료!');
    console.log('✅ 모든 데이터베이스 작업이 정상적으로 작동합니다.');
    
  } catch (error) {
    console.error('❌ MongoDB 연결 테스트 실패:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 해결 방법:');
      console.log('1. MongoDB Atlas에서 사용자 이름과 비밀번호를 확인하세요');
      console.log('2. IP 화이트리스트에 현재 IP를 추가하세요');
      console.log('3. 데이터베이스 사용자 권한을 확인하세요');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 해결 방법:');
      console.log('1. 인터넷 연결을 확인하세요');
      console.log('2. MongoDB Atlas 클러스터가 실행 중인지 확인하세요');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  testMongoDBConnection();
}

module.exports = testMongoDBConnection;














