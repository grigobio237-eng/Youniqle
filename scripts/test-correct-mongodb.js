require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testCorrectMongoDB() {
  console.log('🔍 올바른 MongoDB 연결 테스트...\n');
  
  // 현재 설정된 URI
  console.log('📋 현재 설정된 URI:');
  console.log('   ', process.env.MONGODB_URI);
  
  // 올바른 비밀번호로 수정된 URI
  const correctUri = 'mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('\n🔧 수정된 URI (올바른 비밀번호 사용):');
  console.log('   ', correctUri.replace(':Youniqle2024!', ':***'));
  
  const client = new MongoClient(correctUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
  });
  
  try {
    console.log('\n🧪 연결 테스트...');
    await client.connect();
    
    console.log('   ✅ 연결 성공!');
    
    const db = client.db();
    console.log('   데이터베이스 이름:', db.databaseName);
    
    // 컬렉션 목록 조회
    const collections = await db.listCollections().toArray();
    console.log('   기존 컬렉션 수:', collections.length);
    
    if (collections.length > 0) {
      console.log('   컬렉션 목록:');
      collections.forEach(col => {
        console.log(`     - ${col.name}`);
      });
    }
    
    // 간단한 테스트
    const testCollection = db.collection('connection_test');
    const testDoc = {
      message: '올바른 비밀번호로 연결 테스트',
      timestamp: new Date(),
      status: 'success'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('   ✅ 테스트 문서 삽입 성공:', result.insertedId);
    
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('   ✅ 테스트 문서 삭제 성공');
    
    console.log('\n🎉 MongoDB 연결이 정상적으로 작동합니다!');
    console.log('\n📝 .env.local 파일의 MONGODB_URI를 다음과 같이 수정해주세요:');
    console.log('   MONGODB_URI=mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    
  } catch (error) {
    console.log('   ❌ 연결 실패:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 여전히 인증 실패입니다. 다음을 확인해주세요:');
      console.log('1. MongoDB Atlas에서 사용자 "grigobio237_db_user"가 존재하는지 확인');
      console.log('2. 비밀번호가 "Youniqle2024!"인지 확인');
      console.log('3. 사용자 권한이 readWrite인지 확인');
      console.log('4. IP 화이트리스트에 현재 IP가 있는지 확인');
    }
  } finally {
    await client.close();
    console.log('\n🔌 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  testCorrectMongoDB();
}

module.exports = testCorrectMongoDB;
















