require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// User 스키마 정의
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  role: { type: String, default: 'member' },
  grade: { type: String, default: 'cedar' },
  points: { type: Number, default: 0 },
  provider: String,
  providerId: String,
  marketingConsent: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  addresses: { type: Array, default: [] },
  wishlist: { type: Array, default: [] },
  partnerStatus: { type: String, default: 'none' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function fixGradeValues() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 잘못된 grade 값을 가진 사용자들 찾기
    const invalidUsers = await User.find({
      grade: { $nin: ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'] }
    });

    console.log(`🔍 잘못된 grade 값을 가진 사용자 수: ${invalidUsers.length}`);

    if (invalidUsers.length > 0) {
      console.log('📋 잘못된 grade 값을 가진 사용자들:');
      invalidUsers.forEach(user => {
        console.log(`- ${user.email}: ${user.grade}`);
      });

      // bronze를 cedar로 변경
      const updateResult = await User.updateMany(
        { grade: 'bronze' },
        { $set: { grade: 'cedar' } }
      );
      console.log(`✅ ${updateResult.modifiedCount}명의 사용자 grade를 cedar로 수정`);

      // silver를 rooter로 변경
      const updateResult2 = await User.updateMany(
        { grade: 'silver' },
        { $set: { grade: 'rooter' } }
      );
      console.log(`✅ ${updateResult2.modifiedCount}명의 사용자 grade를 rooter로 수정`);

      // gold를 glower로 변경
      const updateResult3 = await User.updateMany(
        { grade: 'gold' },
        { $set: { grade: 'glower' } }
      );
      console.log(`✅ ${updateResult3.modifiedCount}명의 사용자 grade를 glower로 수정`);

      // 기타 잘못된 값들을 cedar로 변경
      const updateResult4 = await User.updateMany(
        { grade: { $nin: ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'] } },
        { $set: { grade: 'cedar' } }
      );
      console.log(`✅ ${updateResult4.modifiedCount}명의 사용자 grade를 cedar로 수정`);

      // 수정 후 결과 확인
      const remainingInvalid = await User.find({
        grade: { $nin: ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'] }
      });
      console.log(`🔍 수정 후 남은 잘못된 grade 값을 가진 사용자 수: ${remainingInvalid.length}`);
    } else {
      console.log('✅ 모든 사용자의 grade 값이 올바릅니다.');
    }

    // 전체 사용자 grade 분포 확인
    const gradeStats = await User.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 현재 사용자 grade 분포:');
    gradeStats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count}명`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

fixGradeValues();
