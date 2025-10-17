// 데이터베이스 성능 테스트 스크립트
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testDatabasePerformance() {
  try {
    console.log('⚡ 데이터베이스 성능 테스트 시작...');
    
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: true,
    });
    
    console.log('✅ MongoDB 연결 성공');
    
    const db = mongoose.connection.db;
    
    // 1. 사용자 조회 성능 테스트
    console.log('\n📊 1. 사용자 조회 성능 테스트');
    const userStartTime = Date.now();
    const users = await db.collection('users').find({}).limit(100).toArray();
    const userEndTime = Date.now();
    const userQueryTime = userEndTime - userStartTime;
    
    console.log(`  - 조회된 사용자 수: ${users.length}명`);
    console.log(`  - 쿼리 실행 시간: ${userQueryTime}ms`);
    console.log(`  - 평균 사용자당 시간: ${(userQueryTime / users.length).toFixed(2)}ms`);
    
    // 2. 상품 조회 성능 테스트
    console.log('\n📊 2. 상품 조회 성능 테스트');
    const productStartTime = Date.now();
    const products = await db.collection('products').find({}).limit(100).toArray();
    const productEndTime = Date.now();
    const productQueryTime = productEndTime - productStartTime;
    
    console.log(`  - 조회된 상품 수: ${products.length}개`);
    console.log(`  - 쿼리 실행 시간: ${productQueryTime}ms`);
    console.log(`  - 평균 상품당 시간: ${(productQueryTime / products.length).toFixed(2)}ms`);
    
    // 3. 복합 쿼리 성능 테스트
    console.log('\n📊 3. 복합 쿼리 성능 테스트');
    const complexStartTime = Date.now();
    const complexQuery = await db.collection('orders').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $limit: 50
      }
    ]).toArray();
    const complexEndTime = Date.now();
    const complexQueryTime = complexEndTime - complexStartTime;
    
    console.log(`  - 조회된 주문 수: ${complexQuery.length}개`);
    console.log(`  - 복합 쿼리 실행 시간: ${complexQueryTime}ms`);
    
    // 4. 인덱스 성능 테스트
    console.log('\n📊 4. 인덱스 성능 테스트');
    
    // 사용자 이메일로 검색 (인덱스가 있는 필드)
    const emailSearchStart = Date.now();
    const emailUser = await db.collection('users').findOne({ email: 'admin@youniqle.com' });
    const emailSearchEnd = Date.now();
    const emailSearchTime = emailSearchEnd - emailSearchStart;
    
    console.log(`  - 이메일 검색 시간: ${emailSearchTime}ms`);
    console.log(`  - 검색된 사용자: ${emailUser ? emailUser.name : '없음'}`);
    
    // 5. 대량 데이터 삽입 성능 테스트
    console.log('\n📊 5. 대량 데이터 삽입 성능 테스트');
    const testData = [];
    for (let i = 0; i < 100; i++) {
      testData.push({
        testId: `perf-test-${Date.now()}-${i}`,
        timestamp: new Date(),
        data: `Test data ${i}`,
        value: Math.random() * 1000
      });
    }
    
    const insertStartTime = Date.now();
    await db.collection('performance_test').insertMany(testData);
    const insertEndTime = Date.now();
    const insertTime = insertEndTime - insertStartTime;
    
    console.log(`  - 삽입된 문서 수: ${testData.length}개`);
    console.log(`  - 삽입 실행 시간: ${insertTime}ms`);
    console.log(`  - 평균 문서당 시간: ${(insertTime / testData.length).toFixed(2)}ms`);
    
    // 6. 대량 데이터 삭제 성능 테스트
    console.log('\n📊 6. 대량 데이터 삭제 성능 테스트');
    const deleteStartTime = Date.now();
    const deleteResult = await db.collection('performance_test').deleteMany({
      testId: { $regex: /^perf-test-/ }
    });
    const deleteEndTime = Date.now();
    const deleteTime = deleteEndTime - deleteStartTime;
    
    console.log(`  - 삭제된 문서 수: ${deleteResult.deletedCount}개`);
    console.log(`  - 삭제 실행 시간: ${deleteTime}ms`);
    
    // 7. 데이터베이스 통계
    console.log('\n📊 7. 데이터베이스 통계');
    const stats = await db.stats();
    console.log(`  - 데이터베이스 크기: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 인덱스 크기: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 총 컬렉션 수: ${stats.collections}개`);
    console.log(`  - 총 문서 수: ${stats.objects}개`);
    
    // 8. 성능 요약
    console.log('\n📈 성능 요약');
    console.log(`  - 사용자 조회: ${userQueryTime}ms (${users.length}개)`);
    console.log(`  - 상품 조회: ${productQueryTime}ms (${products.length}개)`);
    console.log(`  - 복합 쿼리: ${complexQueryTime}ms (${complexQuery.length}개)`);
    console.log(`  - 이메일 검색: ${emailSearchTime}ms`);
    console.log(`  - 대량 삽입: ${insertTime}ms (${testData.length}개)`);
    console.log(`  - 대량 삭제: ${deleteTime}ms (${deleteResult.deletedCount}개)`);
    
    // 성능 평가
    const performanceScore = evaluatePerformance({
      userQueryTime,
      productQueryTime,
      complexQueryTime,
      emailSearchTime,
      insertTime,
      deleteTime
    });
    
    console.log(`\n🏆 성능 점수: ${performanceScore}/100`);
    
    if (performanceScore >= 80) {
      console.log('✅ 우수한 성능입니다!');
    } else if (performanceScore >= 60) {
      console.log('⚠️ 양호한 성능입니다. 최적화를 고려해보세요.');
    } else {
      console.log('❌ 성능 개선이 필요합니다.');
    }
    
    console.log('\n✅ 데이터베이스 성능 테스트 완료');
    
  } catch (error) {
    console.error('❌ 데이터베이스 성능 테스트 실패:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

function evaluatePerformance(times) {
  let score = 100;
  
  // 각 쿼리 시간에 따른 점수 차감
  if (times.userQueryTime > 100) score -= 10;
  if (times.productQueryTime > 100) score -= 10;
  if (times.complexQueryTime > 500) score -= 15;
  if (times.emailSearchTime > 50) score -= 10;
  if (times.insertTime > 200) score -= 15;
  if (times.deleteTime > 200) score -= 15;
  
  // 추가 점수 차감
  if (times.userQueryTime > 500) score -= 10;
  if (times.productQueryTime > 500) score -= 10;
  if (times.complexQueryTime > 1000) score -= 10;
  
  return Math.max(0, score);
}

testDatabasePerformance();










