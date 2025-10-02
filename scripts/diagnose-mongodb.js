require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function diagnoseMongoDB() {
  console.log('🔍 MongoDB 연결 진단 시작...\n');
  
  // 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '설정됨' : '❌ 설정되지 않음');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '❌ 설정되지 않음');
  console.log('   BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '설정됨' : '❌ 설정되지 않음');
  
  if (!process.env.MONGODB_URI) {
    console.log('\n❌ MONGODB_URI가 설정되지 않았습니다.');
    console.log('💡 .env.local 파일에 MONGODB_URI를 설정해주세요.');
    return;
  }
  
  // MongoDB URI 파싱
  try {
    const uri = process.env.MONGODB_URI;
    console.log('\n🔗 MongoDB URI 분석:');
    
    // 사용자 정보 추출
    const userMatch = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    if (userMatch) {
      console.log('   사용자명:', userMatch[1]);
      console.log('   비밀번호:', userMatch[2] ? '설정됨' : '❌ 설정되지 않음');
    } else {
      console.log('   ❌ 사용자 정보를 찾을 수 없습니다.');
    }
    
    // 호스트 정보 추출
    const hostMatch = uri.match(/@([^\/]+)/);
    if (hostMatch) {
      console.log('   호스트:', hostMatch[1]);
    }
    
    // 데이터베이스 정보 추출
    const dbMatch = uri.match(/\/([^?]+)\?/);
    if (dbMatch) {
      console.log('   데이터베이스:', dbMatch[1]);
    }
    
  } catch (error) {
    console.log('❌ URI 파싱 오류:', error.message);
  }
  
  // 연결 테스트 (여러 방법으로 시도)
  console.log('\n🧪 연결 테스트...');
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5초 타임아웃
    connectTimeoutMS: 10000, // 10초 연결 타임아웃
  });
  
  try {
    console.log('   연결 시도 중...');
    await client.connect();
    
    // 연결 성공 시 정보 출력
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
    
  } catch (error) {
    console.log('   ❌ 연결 실패:', error.message);
    
    // 구체적인 오류 메시지에 따른 해결 방법 제시
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 인증 실패 해결 방법:');
      console.log('1. MongoDB Atlas 웹 콘솔에 로그인');
      console.log('2. Database Access 메뉴에서 사용자 확인');
      console.log('3. 사용자 비밀번호가 올바른지 확인');
      console.log('4. 사용자 권한이 적절한지 확인 (readWrite 권한 필요)');
    } else if (error.message.includes('IP')) {
      console.log('\n🔧 IP 접근 제한 해결 방법:');
      console.log('1. MongoDB Atlas 웹 콘솔에 로그인');
      console.log('2. Network Access 메뉴에서 IP 화이트리스트 확인');
      console.log('3. 현재 IP 주소를 추가하거나 0.0.0.0/0 (모든 IP 허용) 설정');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 네트워크 오류 해결 방법:');
      console.log('1. 인터넷 연결 확인');
      console.log('2. MongoDB Atlas 클러스터가 실행 중인지 확인');
      console.log('3. 방화벽 설정 확인');
    } else {
      console.log('\n🔧 일반적인 해결 방법:');
      console.log('1. MongoDB Atlas 클러스터 상태 확인');
      console.log('2. 연결 문자열이 올바른지 확인');
      console.log('3. 네트워크 연결 상태 확인');
    }
    
  } finally {
    await client.close();
    console.log('\n🔌 연결 종료');
  }
  
  // 추가 권장사항
  console.log('\n📝 추가 확인 사항:');
  console.log('1. MongoDB Atlas 클러스터가 실행 중인지 확인');
  console.log('2. 데이터베이스 사용자가 올바른 권한을 가지고 있는지 확인');
  console.log('3. 현재 IP가 MongoDB Atlas IP 화이트리스트에 있는지 확인');
  console.log('4. 방화벽이나 프록시 설정이 MongoDB 연결을 차단하지 않는지 확인');
}

// 스크립트 실행
if (require.main === module) {
  diagnoseMongoDB();
}

module.exports = diagnoseMongoDB;















