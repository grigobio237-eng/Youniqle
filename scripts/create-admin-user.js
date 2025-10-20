const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User 스키마 정의
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'admin', 'partner'], default: 'member' },
  grade: { type: String, enum: ['cedar', 'pine', 'oak', 'maple', 'walnut'], default: 'cedar' },
  points: { type: Number, default: 0 },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'South Korea' }
  },
  preferences: {
    language: { type: String, default: 'ko' },
    currency: { type: String, default: 'KRW' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB 연결 중...');
    
    // 기존 관리자 계정 확인
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ 이미 관리자 계정이 존재합니다:', existingAdmin.email);
      await mongoose.disconnect();
      return;
    }
    
    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
    
    const adminUser = new User({
      name: '관리자',
      email: 'admin@youniqle.com',
      password: hashedPassword,
      role: 'admin',
      grade: 'walnut',
      points: 10000,
      isEmailVerified: true,
      isActive: true
    });
    
    await adminUser.save();
    console.log('✅ 관리자 계정이 생성되었습니다: admin@youniqle.com');
    console.log('🔑 비밀번호: AdminPassword123!');
    
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  } catch (error) {
    console.error('❌ 오류:', error);
    await mongoose.disconnect();
  }
}

createAdminUser();














