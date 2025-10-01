require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  console.log('📝 .env.local 파일에 MONGODB_URI를 설정해주세요.');
  process.exit(1);
}

// 스키마 정의
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  avatar: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  },
  // 파트너 관련 필드
  partnerStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'suspended'], default: 'none' },
  partnerApplication: {
    businessName: String,
    businessNumber: String,
    businessAddress: String,
    businessPhone: String,
    businessDescription: String,
    bankAccount: String,
    bankName: String,
    accountHolder: String,
    appliedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    rejectedReason: String,
    approvedBy: mongoose.Schema.Types.ObjectId
  },
  partnerSettings: {
    commissionRate: { type: Number, default: 10, min: 0, max: 50 },
    autoApproval: { type: Boolean, default: false },
    notificationEmail: String,
    notificationPhone: String
  },
  partnerStats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    lastSettlementAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createTestData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 테스트 계정 삭제
    console.log('🗑️ 기존 테스트 계정 삭제 중...');
    await User.deleteMany({
      email: { $in: ['admin@youniqle.com', 'partner@youniqle.com', 'user@youniqle.com'] }
    });
    console.log('✅ 기존 테스트 계정 삭제 완료');

    // 비밀번호 해시화
    const adminPassword = await bcrypt.hash('admin123!', 12);
    const partnerPassword = await bcrypt.hash('partner123!', 12);
    const userPassword = await bcrypt.hash('user123!', 12);

    // 1. 관리자 계정 생성
    console.log('👑 관리자 계정 생성 중...');
    const admin = new User({
      email: 'admin@youniqle.com',
      name: '관리자',
      passwordHash: adminPassword,
      role: 'admin',
      emailVerified: true,
      phone: '010-1234-5678',
      address: {
        street: '서울특별시 강남구 테헤란로 123',
        city: '서울',
        state: '강남구',
        zipCode: '06292',
        country: '대한민국'
      },
      preferences: {
        newsletter: true,
        notifications: true
      },
      partnerStatus: 'none'
    });
    await admin.save();
    console.log('✅ 관리자 계정 생성 완료');

    // 2. 파트너 계정 생성 (승인됨)
    console.log('🏪 파트너 계정 생성 중...');
    const partner = new User({
      email: 'partner@youniqle.com',
      name: '김파트너',
      passwordHash: partnerPassword,
      role: 'user',
      emailVerified: true,
      phone: '010-2345-6789',
      address: {
        street: '부산광역시 해운대구 센텀중앙로 456',
        city: '부산',
        state: '해운대구',
        zipCode: '48099',
        country: '대한민국'
      },
      preferences: {
        newsletter: true,
        notifications: true
      },
      partnerStatus: 'approved',
      partnerApplication: {
        businessName: '파트너샵',
        businessNumber: '123-45-67890',
        businessAddress: '부산광역시 해운대구 센텀중앙로 456',
        businessPhone: '051-123-4567',
        businessDescription: '고품질 상품을 합리적인 가격으로 제공하는 파트너샵입니다.',
        bankAccount: '123456789012',
        bankName: '국민은행',
        accountHolder: '김파트너',
        appliedAt: new Date('2024-01-01'),
        approvedAt: new Date('2024-01-02'),
        approvedBy: admin._id
      },
      partnerSettings: {
        commissionRate: 12,
        autoApproval: true,
        notificationEmail: 'partner@youniqle.com',
        notificationPhone: '010-2345-6789'
      },
      partnerStats: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0
      }
    });
    await partner.save();
    console.log('✅ 파트너 계정 생성 완료');

    // 3. 일반 사용자 계정 생성
    console.log('👤 일반 사용자 계정 생성 중...');
    const user = new User({
      email: 'user@youniqle.com',
      name: '이유저',
      passwordHash: userPassword,
      role: 'user',
      emailVerified: true,
      phone: '010-3456-7890',
      address: {
        street: '대구광역시 수성구 동대구로 789',
        city: '대구',
        state: '수성구',
        zipCode: '42170',
        country: '대한민국'
      },
      preferences: {
        newsletter: true,
        notifications: false
      },
      partnerStatus: 'none'
    });
    await user.save();
    console.log('✅ 일반 사용자 계정 생성 완료');

    console.log('\n🎉 테스트 데이터 생성 완료!');
    console.log('\n📋 테스트 계정 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 관리자 계정:');
    console.log('   이메일: admin@youniqle.com');
    console.log('   비밀번호: admin123!');
    console.log('   권한: 모든 관리자 기능 접근 가능');
    console.log('');
    console.log('🏪 파트너 계정 (승인됨):');
    console.log('   이메일: partner@youniqle.com');
    console.log('   비밀번호: partner123!');
    console.log('   사업자명: 파트너샵');
    console.log('   수수료율: 12%');
    console.log('   상태: 승인됨 (모든 파트너 기능 사용 가능)');
    console.log('');
    console.log('👤 일반 사용자 계정:');
    console.log('   이메일: user@youniqle.com');
    console.log('   비밀번호: user123!');
    console.log('   용도: 파트너 신청 테스트용');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 이제 로컬 서버를 실행하고 테스트를 시작하세요!');
    console.log('   npm run dev');

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  createTestData();
}

module.exports = createTestData;
