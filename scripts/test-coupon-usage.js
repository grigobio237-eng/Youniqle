/**
 * 쿠폰 사용 플로우 테스트 스크립트
 * 쿠폰 다운로드 -> 적용 -> 사용 -> 중복 사용 방지 확인
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// 환경 변수 확인
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI가 설정되지 않았습니다.');
  process.exit(1);
}

async function testCouponUsageFlow() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    // 모델 import
    const Coupon = require('../src/models/Coupon').default;
    const UserCoupon = require('../src/models/UserCoupon').default;
    const CouponUsage = require('../src/models/CouponUsage').default;
    const User = require('../src/models/User').default;
    const Order = require('../src/models/Order').default;

    console.log('📊 테스트 시작: 쿠폰 사용 플로우\n');
    console.log('=' .repeat(60));

    // 1. 테스트 사용자 찾기 또는 생성
    console.log('\n1️⃣  테스트 사용자 준비...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('   테스트 사용자를 찾을 수 없습니다. 실제 사용자를 사용하세요.');
      process.exit(1);
    }
    console.log(`   ✅ 사용자: ${testUser.name} (${testUser.email})`);

    // 2. 테스트 쿠폰 생성
    console.log('\n2️⃣  테스트 쿠폰 생성...');
    const testCouponCode = 'TEST' + Date.now().toString().slice(-6);
    
    const testCoupon = new Coupon({
      code: testCouponCode,
      name: '테스트 쿠폰',
      description: '자동 테스트용 쿠폰',
      type: 'fixed',
      value: 5000,
      minOrderAmount: 10000,
      status: 'active',
      validityType: 'fixed',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      targetAudience: 'all',
      createdBy: testUser._id,
      usageLimit: 10,
      userUsageLimit: 1
    });

    await testCoupon.save();
    console.log(`   ✅ 쿠폰 생성: ${testCoupon.code}`);
    console.log(`      - 할인 금액: ${testCoupon.value}원`);
    console.log(`      - 최소 주문 금액: ${testCoupon.minOrderAmount}원`);

    // 3. 쿠폰 다운로드 (UserCoupon 생성)
    console.log('\n3️⃣  쿠폰 다운로드...');
    const userCoupon = new UserCoupon({
      userId: testUser._id,
      couponId: testCoupon._id,
      code: testCoupon.code,
      status: 'available',
      downloadedAt: new Date(),
      validUntil: testCoupon.validUntil
    });

    await userCoupon.save();
    console.log(`   ✅ 쿠폰 다운로드 완료`);
    console.log(`      - 상태: ${userCoupon.status}`);
    console.log(`      - 유효기간: ${userCoupon.validUntil.toLocaleDateString()}`);

    // 4. 쿠폰 사용 (테스트 주문 생성)
    console.log('\n4️⃣  쿠폰 사용 (주문 생성)...');
    const testOrder = new Order({
      userId: testUser._id,
      orderNumber: 'TEST' + Date.now(),
      items: [{
        productId: new mongoose.Types.ObjectId(),
        name: '테스트 상품',
        price: 20000,
        quantity: 1
      }],
      totalAmount: 15000, // 20000 - 5000(쿠폰)
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: {
        label: '테스트',
        recipient: testUser.name,
        phone: '010-1234-5678',
        zip: '12345',
        addr1: '테스트 주소'
      },
      paymentMethod: 'card',
      couponCode: testCoupon.code,
      couponDiscount: 5000
    });

    await testOrder.save();
    console.log(`   ✅ 주문 생성: ${testOrder.orderNumber}`);
    console.log(`      - 원래 금액: 20,000원`);
    console.log(`      - 쿠폰 할인: -5,000원`);
    console.log(`      - 최종 금액: ${testOrder.totalAmount.toLocaleString()}원`);

    // 5. markCouponAsUsed 함수 테스트 (결제 완료 시뮬레이션)
    console.log('\n5️⃣  결제 완료 시뮬레이션 (쿠폰 상태 업데이트)...');
    const { markCouponAsUsed } = require('../src/lib/couponValidator');
    
    const result = await markCouponAsUsed(
      testUser._id.toString(),
      testCoupon.code,
      testOrder._id.toString()
    );

    if (result.success) {
      console.log('   ✅ 쿠폰 사용 처리 성공');
      
      // UserCoupon 상태 확인
      const updatedUserCoupon = await UserCoupon.findOne({
        userId: testUser._id,
        couponId: testCoupon._id
      });
      
      console.log(`      - 상태: available → ${updatedUserCoupon.status}`);
      console.log(`      - 사용 시각: ${updatedUserCoupon.usedAt?.toLocaleString()}`);
      console.log(`      - 주문 ID: ${updatedUserCoupon.orderId}`);
    } else {
      console.error('   ❌ 쿠폰 사용 처리 실패:', result.error);
    }

    // 6. 중복 사용 방지 테스트
    console.log('\n6️⃣  중복 사용 방지 테스트...');
    const duplicateResult = await markCouponAsUsed(
      testUser._id.toString(),
      testCoupon.code,
      new mongoose.Types.ObjectId().toString()
    );

    if (!duplicateResult.success) {
      console.log('   ✅ 중복 사용 방지 성공');
      console.log(`      - 오류 메시지: "${duplicateResult.error}"`);
    } else {
      console.error('   ❌ 중복 사용 방지 실패! 같은 쿠폰을 두 번 사용할 수 있습니다.');
    }

    // 7. 쿠폰 사용 취소 테스트
    console.log('\n7️⃣  쿠폰 사용 취소 테스트 (주문 취소 시뮬레이션)...');
    const { cancelCouponUsage } = require('../src/lib/couponValidator');
    
    const cancelResult = await cancelCouponUsage(
      testUser._id.toString(),
      testCoupon.code,
      testOrder._id.toString()
    );

    if (cancelResult.success) {
      console.log('   ✅ 쿠폰 사용 취소 성공');
      
      const restoredUserCoupon = await UserCoupon.findOne({
        userId: testUser._id,
        couponId: testCoupon._id
      });
      
      console.log(`      - 상태: used → ${restoredUserCoupon.status}`);
      console.log(`      - 사용 시각: ${restoredUserCoupon.usedAt || '없음'}`);
      console.log(`      - 주문 ID: ${restoredUserCoupon.orderId || '없음'}`);
    } else {
      console.error('   ❌ 쿠폰 사용 취소 실패:', cancelResult.error);
    }

    // 8. 정리
    console.log('\n8️⃣  테스트 데이터 정리...');
    await UserCoupon.deleteOne({ _id: userCoupon._id });
    await Coupon.deleteOne({ _id: testCoupon._id });
    await Order.deleteOne({ _id: testOrder._id });
    console.log('   ✅ 테스트 데이터 삭제 완료');

    console.log('\n' + '=' .repeat(60));
    console.log('✅ 모든 테스트 완료!\n');

    // 통계 출력
    console.log('📊 현재 쿠폰 통계:');
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ status: 'active' });
    const totalUserCoupons = await UserCoupon.countDocuments();
    const usedUserCoupons = await UserCoupon.countDocuments({ status: 'used' });
    const totalUsages = await CouponUsage.countDocuments();

    console.log(`   - 전체 쿠폰: ${totalCoupons}개`);
    console.log(`   - 활성 쿠폰: ${activeCoupons}개`);
    console.log(`   - 다운로드된 쿠폰: ${totalUserCoupons}개`);
    console.log(`   - 사용된 쿠폰: ${usedUserCoupons}개`);
    console.log(`   - 전체 사용 기록: ${totalUsages}건`);

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
testCouponUsageFlow();

