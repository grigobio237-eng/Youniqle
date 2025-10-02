require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// User 스키마 정의 (파트너 관련 필드 포함)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'admin', 'member'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  avatar: String,
  phone: String,
  // 파트너 관련 필드
  partnerStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'suspended'], default: 'none' },
  partnerApplication: {
    businessName: String,
    businessNumber: String,
    businessAddress: String,
    businessDetailAddress: String,
    businessPhone: String,
    businessDescription: String,
    bankAccount: String,
    bankName: String,
    accountHolder: String,
    businessRegistrationImage: String,
    bankStatementImage: String,
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

async function checkPartnerData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모든 사용자 조회
    const allUsers = await User.find({}).select('email name role partnerStatus partnerApplication createdAt');
    
    console.log(`\n📊 총 ${allUsers.length}명의 사용자:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   역할: ${user.role}`);
      console.log(`   파트너 상태: ${user.partnerStatus}`);
      if (user.partnerApplication && Object.keys(user.partnerApplication).length > 0) {
        console.log(`   파트너 신청 정보:`);
        console.log(`     - 사업자명: ${user.partnerApplication.businessName || '없음'}`);
        console.log(`     - 사업자번호: ${user.partnerApplication.businessNumber || '없음'}`);
        console.log(`     - 신청일: ${user.partnerApplication.appliedAt || '없음'}`);
        console.log(`     - 승인일: ${user.partnerApplication.approvedAt || '없음'}`);
        console.log(`     - 거부일: ${user.partnerApplication.rejectedAt || '없음'}`);
      }
      console.log('   ──────────────────────────────────────');
    });

    // 파트너 신청자만 조회
    const partnerApplicants = await User.find({ 
      partnerStatus: { $in: ['pending', 'approved', 'rejected'] }
    });
    
    console.log(`\n🏪 파트너 신청자 (${partnerApplicants.length}명):`);
    if (partnerApplicants.length === 0) {
      console.log('   파트너 신청자가 없습니다.');
    } else {
      partnerApplicants.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.partnerStatus}`);
        if (user.partnerApplication) {
          console.log(`   사업자명: ${user.partnerApplication.businessName || '없음'}`);
          console.log(`   신청일: ${user.partnerApplication.appliedAt || '없음'}`);
        }
      });
    }

    // 승인 대기 중인 파트너
    const pendingPartners = await User.find({ partnerStatus: 'pending' });
    console.log(`\n⏳ 승인 대기 중인 파트너: ${pendingPartners.length}명`);

  } catch (error) {
    console.error('❌ 파트너 데이터 확인 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkPartnerData();
















