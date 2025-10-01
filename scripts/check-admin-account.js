require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

async function checkAdminAccount() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 관리자 계정 조회
    const admin = await User.findOne({ 
      email: 'admin@youniqle.com',
      role: 'admin'
    });
    
    if (!admin) {
      console.log('❌ admin@youniqle.com 관리자 계정을 찾을 수 없습니다.');
      
      // 모든 관리자 계정 조회
      const allAdmins = await User.find({ role: 'admin' });
      console.log('\n📋 현재 데이터베이스의 모든 관리자 계정:');
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email} - ${admin.name}`);
      });
      
      return;
    }

    console.log('\n👑 관리자 계정 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('이메일:', admin.email);
    console.log('이름:', admin.name);
    console.log('역할:', admin.role);
    console.log('이메일 인증:', admin.emailVerified);
    console.log('비밀번호 해시 존재:', !!admin.passwordHash);
    console.log('비밀번호 해시 길이:', admin.passwordHash?.length || 0);
    console.log('생성일:', admin.createdAt);
    console.log('수정일:', admin.updatedAt);

    // 비밀번호 테스트
    if (admin.passwordHash) {
      console.log('\n🔑 비밀번호 테스트:');
      const testPassword = 'admin123!';
      const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
      console.log('테스트 비밀번호:', testPassword);
      console.log('비밀번호 검증 결과:', isValid);
      
      if (!isValid) {
        console.log('\n⚠️ 비밀번호가 일치하지 않습니다!');
        console.log('새로운 해시를 생성합니다...');
        
        const newHash = await bcrypt.hash(testPassword, 12);
        admin.passwordHash = newHash;
        admin.emailVerified = true;
        await admin.save();
        
        console.log('✅ 관리자 계정이 업데이트되었습니다.');
        console.log('새 비밀번호 해시:', newHash);
      } else {
        console.log('✅ 비밀번호가 정상적으로 일치합니다.');
      }
    } else {
      console.log('\n⚠️ 비밀번호 해시가 없습니다!');
      console.log('새로운 비밀번호 해시를 생성합니다...');
      
      const newHash = await bcrypt.hash('admin123!', 12);
      admin.passwordHash = newHash;
      admin.emailVerified = true;
      await admin.save();
      
      console.log('✅ 관리자 계정에 비밀번호가 설정되었습니다.');
      console.log('새 비밀번호 해시:', newHash);
    }

  } catch (error) {
    console.error('❌ 관리자 계정 확인 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkAdminAccount();














