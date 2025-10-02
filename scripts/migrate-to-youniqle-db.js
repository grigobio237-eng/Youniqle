require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function migrateToYouniqleDB() {
  try {
    console.log('🔄 데이터베이스 마이그레이션 시작...');
    
    // 현재 test 데이터베이스에 연결
    const currentUri = process.env.MONGODB_URI;
    if (!currentUri) {
      console.log('❌ MONGODB_URI가 설정되지 않았습니다.');
      console.log('💡 .env.local 파일을 생성하고 MONGODB_URI를 설정하세요.');
      return;
    }
    
    console.log('📍 현재 URI:', currentUri);
    
    // youniqle 데이터베이스 URI 생성
    const youniqleUri = currentUri.replace(/\/[^\/]+$/, '/youniqle');
    console.log('📍 youniqle URI:', youniqleUri);
    
    // test 데이터베이스 연결
    await mongoose.connect(currentUri);
    console.log('✅ test 데이터베이스 연결 성공');
    
    // youniqle 데이터베이스 연결
    const youniqleConnection = mongoose.createConnection(youniqleUri);
    console.log('✅ youniqle 데이터베이스 연결 성공');
    
    // User 스키마 정의
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      avatar: String,
      role: { type: String, default: 'user' },
      grade: { type: String, default: 'cedar' },
      points: { type: Number, default: 0 },
      provider: String,
      providerId: String,
      marketingConsent: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      addresses: [{ type: mongoose.Schema.Types.Mixed }],
      partnerStatus: String,
      partnerSettings: { type: mongoose.Schema.Types.Mixed },
      partnerStats: { type: mongoose.Schema.Types.Mixed },
      partnerApplication: { type: mongoose.Schema.Types.Mixed },
      wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      phone: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    // 모델 생성
    const TestUser = mongoose.model('User', userSchema);
    const YouniqleUser = youniqleConnection.model('User', userSchema);
    
    // test 데이터베이스의 모든 사용자 조회
    const testUsers = await TestUser.find({});
    console.log(`📊 test 데이터베이스에서 ${testUsers.length}명의 사용자 발견`);
    
    // youniqle 데이터베이스의 기존 사용자 조회
    const existingYouniqleUsers = await YouniqleUser.find({});
    console.log(`📊 youniqle 데이터베이스에 ${existingYouniqleUsers.length}명의 사용자 존재`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // 각 사용자를 youniqle 데이터베이스로 마이그레이션
    for (const user of testUsers) {
      const existingUser = await YouniqleUser.findOne({ email: user.email });
      
      if (existingUser) {
        console.log(`⏭️  ${user.email} - 이미 존재함, 건너뜀`);
        skippedCount++;
      } else {
        // 새 사용자 생성
        const newUser = new YouniqleUser(user.toObject());
        await newUser.save();
        console.log(`✅ ${user.email} - 마이그레이션 완료`);
        migratedCount++;
      }
    }
    
    // 최종 결과 확인
    const finalYouniqleUsers = await YouniqleUser.find({});
    console.log('\n📊 마이그레이션 결과:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`마이그레이션된 사용자: ${migratedCount}명`);
    console.log(`건너뛴 사용자: ${skippedCount}명`);
    console.log(`youniqle 데이터베이스 총 사용자: ${finalYouniqleUsers.length}명`);
    
    console.log('\n📋 youniqle 데이터베이스 사용자 목록:');
    finalYouniqleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - 역할: ${user.role}`);
    });
    
    console.log('\n💡 다음 단계:');
    console.log('1. .env.local 파일을 생성하고 MONGODB_URI를 youniqle 데이터베이스로 변경');
    console.log('2. 애플리케이션을 재시작하여 새 데이터베이스 연결 확인');
    
    await youniqleConnection.close();
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

migrateToYouniqleDB();
