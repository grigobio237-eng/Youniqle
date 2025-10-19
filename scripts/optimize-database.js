// 데이터베이스 성능 최적화 스크립트
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function optimizeDatabase() {
  console.log('🔧 데이터베이스 성능 최적화 시작...');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    const db = mongoose.connection.db;

    // 1. 상품 컬렉션 인덱스 최적화
    console.log('\n📊 1. 상품 컬렉션 인덱스 최적화');
    
    const productIndexes = [
      { name: 1 }, // 상품명 검색용
      { category: 1 }, // 카테고리별 조회용
      { price: 1 }, // 가격 정렬용
      { createdAt: -1 }, // 최신순 정렬용
      { isFeatured: 1 }, // 추천 상품 조회용
      { stock: 1 }, // 재고 조회용
      { brand: 1 }, // 브랜드별 조회용
      { tags: 1 }, // 태그 검색용
      { "ratings.average": -1 }, // 평점 정렬용
      { "ratings.count": -1 }, // 리뷰 수 정렬용
      { name: "text", description: "text", tags: "text" } // 텍스트 검색용
    ];

    for (const index of productIndexes) {
      try {
        await db.collection('products').createIndex(index);
        console.log(`  ✅ 인덱스 생성: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️ 인덱스 이미 존재: ${JSON.stringify(index)}`);
        } else {
          console.log(`  ❌ 인덱스 생성 실패: ${JSON.stringify(index)} - ${error.message}`);
        }
      }
    }

    // 2. 사용자 컬렉션 인덱스 최적화
    console.log('\n👥 2. 사용자 컬렉션 인덱스 최적화');
    
    const userIndexes = [
      { email: 1 }, // 이메일 검색용 (이미 unique)
      { role: 1 }, // 역할별 조회용
      { grade: 1 }, // 등급별 조회용
      { createdAt: -1 }, // 가입일 정렬용
      { lastLoginAt: -1 }, // 최근 로그인 정렬용
      { isActive: 1 }, // 활성 사용자 조회용
      { points: -1 } // 포인트 정렬용
    ];

    for (const index of userIndexes) {
      try {
        await db.collection('users').createIndex(index);
        console.log(`  ✅ 인덱스 생성: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️ 인덱스 이미 존재: ${JSON.stringify(index)}`);
        } else {
          console.log(`  ❌ 인덱스 생성 실패: ${JSON.stringify(index)} - ${error.message}`);
        }
      }
    }

    // 3. 주문 컬렉션 인덱스 최적화
    console.log('\n📦 3. 주문 컬렉션 인덱스 최적화');
    
    const orderIndexes = [
      { userId: 1 }, // 사용자별 주문 조회용
      { status: 1 }, // 상태별 조회용
      { createdAt: -1 }, // 주문일 정렬용
      { orderNumber: 1 }, // 주문번호 검색용
      { paymentStatus: 1 }, // 결제 상태별 조회용
      { totalAmount: -1 }, // 금액 정렬용
      { userId: 1, status: 1 }, // 복합 인덱스
      { createdAt: -1, status: 1 }, // 복합 인덱스
      { "items.productId": 1 } // 상품별 주문 조회용
    ];

    for (const index of orderIndexes) {
      try {
        await db.collection('orders').createIndex(index);
        console.log(`  ✅ 인덱스 생성: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️ 인덱스 이미 존재: ${JSON.stringify(index)}`);
        } else {
          console.log(`  ❌ 인덱스 생성 실패: ${JSON.stringify(index)} - ${error.message}`);
        }
      }
    }

    // 4. 장바구니 컬렉션 인덱스 최적화
    console.log('\n🛒 4. 장바구니 컬렉션 인덱스 최적화');
    
    const cartIndexes = [
      { userId: 1 }, // 사용자별 장바구니 조회용
      { "items.productId": 1 }, // 상품별 장바구니 조회용
      { updatedAt: -1 } // 최근 업데이트 정렬용
    ];

    for (const index of cartIndexes) {
      try {
        await db.collection('carts').createIndex(index);
        console.log(`  ✅ 인덱스 생성: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️ 인덱스 이미 존재: ${JSON.stringify(index)}`);
        } else {
          console.log(`  ❌ 인덱스 생성 실패: ${JSON.stringify(index)} - ${error.message}`);
        }
      }
    }

    // 5. 알림 컬렉션 인덱스 최적화
    console.log('\n🔔 5. 알림 컬렉션 인덱스 최적화');
    
    const notificationIndexes = [
      { userId: 1 }, // 사용자별 알림 조회용
      { type: 1 }, // 알림 타입별 조회용
      { status: 1 }, // 상태별 조회용
      { createdAt: -1 }, // 생성일 정렬용
      { userId: 1, status: 1 }, // 복합 인덱스
      { userId: 1, createdAt: -1 } // 복합 인덱스
    ];

    for (const index of notificationIndexes) {
      try {
        await db.collection('notifications').createIndex(index);
        console.log(`  ✅ 인덱스 생성: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️ 인덱스 이미 존재: ${JSON.stringify(index)}`);
        } else {
          console.log(`  ❌ 인덱스 생성 실패: ${JSON.stringify(index)} - ${error.message}`);
        }
      }
    }

    // 6. 연결 풀 설정 최적화
    console.log('\n🔗 6. 연결 풀 설정 최적화');
    
    const connectionOptions = {
      maxPoolSize: 10, // 최대 연결 수
      minPoolSize: 2, // 최소 연결 수
      maxIdleTimeMS: 30000, // 30초
      serverSelectionTimeoutMS: 5000, // 5초
      socketTimeoutMS: 45000, // 45초
      bufferCommands: true,
      bufferMaxEntries: 0
    };

    console.log('  📝 연결 풀 설정:');
    console.log(`    - 최대 연결 수: ${connectionOptions.maxPoolSize}`);
    console.log(`    - 최소 연결 수: ${connectionOptions.minPoolSize}`);
    console.log(`    - 최대 유휴 시간: ${connectionOptions.maxIdleTimeMS}ms`);
    console.log(`    - 서버 선택 타임아웃: ${connectionOptions.serverSelectionTimeoutMS}ms`);

    // 7. 기존 인덱스 분석
    console.log('\n📈 7. 기존 인덱스 분석');
    
    const collections = ['products', 'users', 'orders', 'carts', 'notifications'];
    
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`\n  📊 ${collectionName} 컬렉션 인덱스:`);
        indexes.forEach((index, i) => {
          console.log(`    ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
        });
      } catch (error) {
        console.log(`  ❌ ${collectionName} 인덱스 조회 실패: ${error.message}`);
      }
    }

    // 8. 성능 통계
    console.log('\n📊 8. 성능 통계');
    
    for (const collectionName of collections) {
      try {
        const stats = await db.collection(collectionName).stats();
        console.log(`\n  📈 ${collectionName} 컬렉션 통계:`);
        console.log(`    - 문서 수: ${stats.count}개`);
        console.log(`    - 크기: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`    - 인덱스 크기: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`);
        console.log(`    - 평균 문서 크기: ${(stats.avgObjSize || 0).toFixed(2)} bytes`);
      } catch (error) {
        console.log(`  ❌ ${collectionName} 통계 조회 실패: ${error.message}`);
      }
    }

    console.log('\n✅ 데이터베이스 성능 최적화 완료!');
    console.log('\n💡 권장사항:');
    console.log('  - 정기적으로 인덱스 사용률 모니터링');
    console.log('  - 사용하지 않는 인덱스 제거');
    console.log('  - 쿼리 실행 계획 분석');
    console.log('  - 복합 쿼리 최적화');

  } catch (error) {
    console.error('❌ 데이터베이스 최적화 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

optimizeDatabase();













