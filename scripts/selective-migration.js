require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function selectiveMigration() {
  try {
    console.log('🔄 선택적 데이터 마이그레이션 시작...');
    
    // 소스 데이터베이스 URI (test)
    const sourceUri = process.env.MONGODB_URI.replace('/youniqle', '/test');
    // 타겟 데이터베이스 URI (youniqle)
    const targetUri = process.env.MONGODB_URI;
    
    console.log('📍 소스:', sourceUri);
    console.log('📍 타겟:', targetUri);
    
    // 두 데이터베이스 연결
    const sourceConnection = mongoose.createConnection(sourceUri);
    await mongoose.connect(targetUri);
    
    console.log('✅ 두 데이터베이스 연결 성공');
    
    // 컬렉션별 마이그레이션 설정
    const migrationConfig = [
      {
        name: 'users',
        uniqueField: 'email',
        description: '사용자 데이터'
      },
      {
        name: 'orders',
        uniqueField: '_id',
        description: '주문 데이터'
      },
      {
        name: 'products',
        uniqueField: '_id',
        description: '상품 데이터'
      },
      {
        name: 'carts',
        uniqueField: '_id',
        description: '장바구니 데이터'
      },
      {
        name: 'reviews',
        uniqueField: '_id',
        description: '리뷰 데이터'
      },
      {
        name: 'questions',
        uniqueField: '_id',
        description: '문의 데이터'
      },
      {
        name: 'contents',
        uniqueField: '_id',
        description: '콘텐츠 데이터'
      }
    ];
    
    // 스키마 정의 (유연한 스키마)
    const flexibleSchema = new mongoose.Schema({}, { strict: false });
    
    for (const config of migrationConfig) {
      try {
        console.log(`\n📁 ${config.description} 마이그레이션 시작...`);
        
        const SourceModel = sourceConnection.model(config.name, flexibleSchema);
        const TargetModel = mongoose.model(config.name, flexibleSchema);
        
        // 소스에서 모든 문서 조회
        const sourceDocs = await SourceModel.find({});
        console.log(`   📊 소스에서 ${sourceDocs.length}개 문서 발견`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const doc of sourceDocs) {
          try {
            // 중복 확인
            let existingDoc = null;
            
            if (config.uniqueField === 'email') {
              existingDoc = await TargetModel.findOne({ email: doc.email });
            } else {
              existingDoc = await TargetModel.findById(doc._id);
            }
            
            if (existingDoc) {
              console.log(`   ⏭️  ${config.uniqueField === 'email' ? doc.email : doc._id} - 이미 존재, 건너뜀`);
              skippedCount++;
            } else {
              // 새 문서 생성
              const newDoc = new TargetModel(doc.toObject());
              await newDoc.save();
              console.log(`   ✅ ${config.uniqueField === 'email' ? doc.email : doc._id} - 마이그레이션 완료`);
              migratedCount++;
            }
          } catch (error) {
            console.log(`   ❌ 문서 처리 실패:`, error.message);
          }
        }
        
        console.log(`   📊 결과: 마이그레이션 ${migratedCount}개, 건너뜀 ${skippedCount}개`);
        
      } catch (error) {
        console.log(`❌ ${config.name} 컬렉션 마이그레이션 실패:`, error.message);
      }
    }
    
    console.log('\n🎉 선택적 마이그레이션 완료!');
    
    await sourceConnection.close();
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

// 사용법 안내
console.log('💡 선택적 마이그레이션 스크립트');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('이 스크립트는 test 데이터베이스에서 youniqle 데이터베이스로');
console.log('중복되지 않는 데이터만 선택적으로 마이그레이션합니다.');
console.log('');
console.log('실행하려면: node scripts/selective-migration.js');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 스크립트가 직접 실행된 경우에만 마이그레이션 실행
if (require.main === module) {
  selectiveMigration();
}
