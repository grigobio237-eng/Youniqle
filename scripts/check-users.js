require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// User 스키마 정의
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'admin', 'member'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  avatar: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모든 사용자 조회
    const users = await User.find({}).select('email name role emailVerified createdAt');
    
    console.log(`\n📊 총 ${users.length}명의 사용자 발견:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 이메일: ${user.email}`);
      console.log(`   이름: ${user.name}`);
      console.log(`   역할: ${user.role}`);
      console.log(`   이메일 인증: ${user.emailVerified}`);
      console.log(`   생성일: ${user.createdAt}`);
      console.log('   ──────────────────────────────────────');
    });

    // grigobio 관련 계정 찾기
    const grigobioUsers = await User.find({ 
      email: { $regex: /grigobio/i } 
    });
    
    if (grigobioUsers.length > 0) {
      console.log('\n🔍 grigobio 관련 계정들:');
      grigobioUsers.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ 사용자 조회 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkUsers();














