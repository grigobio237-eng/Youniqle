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

async function convertToAdmin() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // grigobio237@gmail.com 계정 찾기
    const user = await User.findOne({ email: 'grigobio237@gmail.com' });
    
    if (!user) {
      console.log('❌ grigobio237@gmail.com 계정을 찾을 수 없습니다.');
      return;
    }

    console.log('👤 현재 계정 정보:');
    console.log('- 이메일:', user.email);
    console.log('- 이름:', user.name);
    console.log('- 역할:', user.role);
    console.log('- 이메일 인증:', user.emailVerified);

    // 비밀번호 해시 생성
    const adminPassword = await bcrypt.hash('admin123!', 12);

    // 관리자로 변경
    user.role = 'admin';
    user.passwordHash = adminPassword;
    user.emailVerified = true;

    await user.save();

    console.log('\n🎉 관리자 계정으로 변경 완료!');
    console.log('\n📋 로그인 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 관리자 계정:');
    console.log('   이메일: grigobio237@gmail.com');
    console.log('   비밀번호: admin123!');
    console.log('   권한: 모든 관리자 기능 접근 가능');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 관리자 변환 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  convertToAdmin();
}

module.exports = convertToAdmin;














