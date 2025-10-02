require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function compareDatabases() {
  try {
    console.log('🔍 데이터베이스 비교 시작...');
    
    // 현재 URI (youniqle)
    const currentUri = process.env.MONGODB_URI;
    console.log('📍 현재 URI:', currentUri);
    
    // test 데이터베이스 URI
    const testUri = currentUri.replace('/youniqle', '/test');
    console.log('📍 test URI:', testUri);
    
    // 두 데이터베이스 연결
    await mongoose.connect(currentUri);
    console.log('✅ youniqle 데이터베이스 연결 성공');
    
    const testConnection = mongoose.createConnection(testUri);
    console.log('✅ test 데이터베이스 연결 성공');
    
    // 컬렉션 스키마 정의
    const userSchema = new mongoose.Schema({}, { strict: false });
    const orderSchema = new mongoose.Schema({}, { strict: false });
    const productSchema = new mongoose.Schema({}, { strict: false });
    const cartSchema = new mongoose.Schema({}, { strict: false });
    const reviewSchema = new mongoose.Schema({}, { strict: false });
    const questionSchema = new mongoose.Schema({}, { strict: false });
    const contentSchema = new mongoose.Schema({}, { strict: false });
    
    // 모델 생성
    const YouniqleUser = mongoose.model('User', userSchema);
    const YouniqleOrder = mongoose.model('Order', orderSchema);
    const YouniqleProduct = mongoose.model('Product', productSchema);
    const YouniqleCart = mongoose.model('Cart', cartSchema);
    const YouniqleReview = mongoose.model('Review', reviewSchema);
    const YouniqleQuestion = mongoose.model('Question', questionSchema);
    const YouniqleContent = mongoose.model('Content', contentSchema);
    
    const TestUser = testConnection.model('User', userSchema);
    const TestOrder = testConnection.model('Order', orderSchema);
    const TestProduct = testConnection.model('Product', productSchema);
    const TestCart = testConnection.model('Cart', cartSchema);
    const TestReview = testConnection.model('Review', reviewSchema);
    const TestQuestion = testConnection.model('Question', questionSchema);
    const TestContent = testConnection.model('Content', contentSchema);
    
    const collections = [
      { name: 'users', youniqleModel: YouniqleUser, testModel: TestUser },
      { name: 'orders', youniqleModel: YouniqleOrder, testModel: TestOrder },
      { name: 'products', youniqleModel: YouniqleProduct, testModel: TestProduct },
      { name: 'carts', youniqleModel: YouniqleCart, testModel: TestCart },
      { name: 'reviews', youniqleModel: YouniqleReview, testModel: TestReview },
      { name: 'questions', youniqleModel: YouniqleQuestion, testModel: TestQuestion },
      { name: 'contents', youniqleModel: YouniqleContent, testModel: TestContent }
    ];
    
    console.log('\n📊 데이터베이스 비교 결과:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const collection of collections) {
      try {
        const youniqleCount = await collection.youniqleModel.countDocuments();
        const testCount = await collection.testModel.countDocuments();
        
        console.log(`📁 ${collection.name}:`);
        console.log(`   youniqle: ${youniqleCount}개`);
        console.log(`   test: ${testCount}개`);
        console.log(`   차이: ${testCount - youniqleCount}개`);
        console.log('   ─────────────────────────────────────');
      } catch (error) {
        console.log(`❌ ${collection.name} 확인 실패:`, error.message);
      }
    }
    
    // 사용자 상세 비교
    console.log('\n👥 사용자 상세 비교:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const youniqleUsers = await YouniqleUser.find({}, 'email name role createdAt');
    const testUsers = await TestUser.find({}, 'email name role createdAt');
    
    console.log('📋 youniqle 데이터베이스 사용자:');
    youniqleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });
    
    console.log('\n📋 test 데이터베이스 사용자:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });
    
    console.log('\n💡 마이그레이션 권장사항:');
    console.log('- test 데이터베이스에 더 많은 데이터가 있는 경우');
    console.log('- youniqle 데이터베이스로 선택적 마이그레이션 수행');
    console.log('- 중복 데이터는 건너뛰고 새로운 데이터만 이전');
    
    await testConnection.close();
    
  } catch (error) {
    console.error('❌ 비교 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

compareDatabases();
