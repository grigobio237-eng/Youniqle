/**
 * 공지사항 데모 데이터 생성 스크립트
 * 
 * 실행 방법:
 * node scripts/create-demo-notices.js
 * 
 * 생성되는 공지사항:
 * - 일반 공지사항 2개
 * - 중요 공지사항 2개 (상단 고정)
 * - 이벤트 공지사항 2개
 * - 점검 안내 1개
 * - 팝업 공지사항 1개
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB 연결
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI가 .env.local에 설정되지 않았습니다.');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
}

// Notice 스키마 정의
const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: String,
  type: { 
    type: String, 
    enum: ['general', 'important', 'event', 'maintenance', 'update'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  isPinned: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  isPopup: { type: Boolean, default: false },
  targetAudience: { 
    type: String, 
    enum: ['all', 'new', 'existing', 'partner', 'admin'],
    default: 'all' 
  },
  popupSettings: {
    width: { type: Number, default: 500 },
    height: { type: Number, default: 600 },
    displayDays: { type: Number, default: 1 },
    backgroundColor: String,
  },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, required: true },
  viewCount: { type: Number, default: 0 },
  tags: [String],
  publishedAt: Date,
}, { timestamps: true });

const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

// 데모 공지사항 데이터
const demoNotices = [
  // 1. 팝업 공지사항 (이벤트)
  {
    title: '🎉 Youniqle 신규 회원 특별 혜택 안내',
    summary: '신규 회원 가입 시 즉시 사용 가능한 10% 할인 쿠폰을 드립니다!',
    content: `안녕하세요, Youniqle입니다.

신규 회원 여러분을 위한 특별한 혜택을 준비했습니다!

🎁 신규 회원 혜택
━━━━━━━━━━━━━━━━━━
✅ 즉시 사용 가능한 10% 할인 쿠폰 (5만원 이상 구매 시)
✅ 첫 구매 시 무료 배송
✅ 회원 등급별 추가 적립 혜택
✅ 생일 축하 쿠폰 (생일 당일 발급)

📅 이벤트 기간: 2025년 10월 1일 ~ 12월 31일
💳 쿠폰 유효기간: 발급일로부터 30일

지금 바로 회원가입하고 특별한 혜택을 받아보세요!

문의사항이 있으시면 고객센터(1577-0729)로 연락주세요.

감사합니다.`,
    type: 'event',
    status: 'published',
    isPinned: false,
    isImportant: true,
    isPopup: true,
    targetAudience: 'new',
    popupSettings: {
      width: 500,
      height: 600,
      displayDays: 1,
      backgroundColor: '#FFF9F0',
    },
    tags: ['이벤트', '신규회원', '할인쿠폰'],
    publishedAt: new Date(),
  },
  
  // 2. 중요 공지 - 상단 고정
  {
    title: '[필독] Youniqle 이용 안내',
    summary: 'Youniqle 쇼핑몰 이용 시 꼭 확인해야 할 중요 사항입니다.',
    content: `Youniqle을 이용해주시는 고객님께 감사드립니다.

원활한 쇼핑을 위해 다음 사항을 확인해주세요.

📌 주요 안내사항
━━━━━━━━━━━━━━━━━━
1. 배송 관련
   - 평일 오후 3시 이전 주문: 당일 출고
   - 평일 오후 3시 이후 주문: 익일 출고
   - 주말/공휴일 주문: 다음 영업일 출고

2. 반품/교환
   - 제품 수령 후 7일 이내 가능
   - 착용 또는 사용 흔적이 있는 경우 불가
   - 반품 배송비: 고객 부담 (단, 제품 하자 시 무료)

3. 고객센터 운영시간
   - 평일: 오전 9시 ~ 오후 6시
   - 점심시간: 오후 12시 ~ 1시
   - 주말/공휴일: 휴무

4. 결제 수단
   - 신용카드, 실시간 계좌이체, 무통장입금
   - 포인트 적립 및 사용 가능

궁금하신 사항은 FAQ 또는 1:1 문의를 이용해주세요.

감사합니다.`,
    type: 'important',
    status: 'published',
    isPinned: true,
    isImportant: true,
    isPopup: false,
    targetAudience: 'all',
    tags: ['필독', '이용안내', '배송', '반품'],
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
  },

  // 3. 일반 공지
  {
    title: '가을 시즌 신상품 입고 안내',
    summary: '2025 가을 신상품이 입고되었습니다. 지금 바로 만나보세요!',
    content: `안녕하세요, Youniqle입니다.

선선한 가을을 맞아 2025 가을 신상품이 입고되었습니다.

🍂 신상품 카테고리
━━━━━━━━━━━━━━━━━━
• 가을 재킷 & 아우터
• 니트 & 스웨터
• 가을 원피스
• 가을 신발 & 악세서리

🎨 트렌드 컬러
• 어스톤 (갈색, 베이지, 카키)
• 버건디 (와인, 마룬)
• 네이비 & 그레이

📦 배송 정보
• 전 상품 무료배송
• 빠른 배송 (1-2일 소요)

지금 바로 가을 신상품을 만나보세요!`,
    type: 'general',
    status: 'published',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'all',
    tags: ['신상품', '가을', '입고'],
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
  },

  // 4. 이벤트 공지
  {
    title: '🎁 10월 감사 이벤트 - 최대 30% 할인',
    summary: '고객님들께 감사한 마음을 담아 특별한 할인 이벤트를 준비했습니다!',
    content: `Youniqle을 사랑해주시는 고객님께 감사드립니다.

10월 한 달간 특별한 할인 이벤트를 진행합니다!

🎉 이벤트 내용
━━━━━━━━━━━━━━━━━━
1️⃣ 주간 타임세일 (매주 월요일)
   - 선착순 100명 30% 할인

2️⃣ 카테고리별 할인
   - 의류: 20% 할인
   - 악세서리: 15% 할인
   - 신발: 25% 할인

3️⃣ 추가 혜택
   - 5만원 이상 구매 시 무료배송
   - 10만원 이상 구매 시 사은품 증정
   - 회원 등급별 추가 포인트 적립

📅 이벤트 기간
• 2025년 10월 1일 ~ 10월 31일

💡 유의사항
• 중복 할인 불가
• 세일 상품 제외
• 일부 브랜드 제외

놓치지 마세요!`,
    type: 'event',
    status: 'published',
    isPinned: true,
    isImportant: true,
    isPopup: false,
    targetAudience: 'all',
    tags: ['이벤트', '할인', '10월'],
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
  },

  // 5. 점검 안내
  {
    title: '[점검 안내] 시스템 정기 점검 실시',
    summary: '서비스 품질 향상을 위한 정기 점검이 실시됩니다.',
    content: `안녕하세요, Youniqle입니다.

더 나은 서비스 제공을 위해 시스템 정기 점검을 실시합니다.

⚙️ 점검 일정
━━━━━━━━━━━━━━━━━━
• 일시: 2025년 10월 25일 (수) 02:00 ~ 05:00
• 소요 시간: 약 3시간 (상황에 따라 변동 가능)

🔧 점검 내용
• 서버 안정화 작업
• 데이터베이스 최적화
• 보안 패치 적용
• 결제 시스템 점검

⚠️ 점검 중 이용 불가 서비스
• 회원가입/로그인
• 상품 주문/결제
• 장바구니 담기
• 마이페이지

💡 참고사항
• 점검 전 장바구니에 담긴 상품은 유지됩니다
• 점검 시간은 상황에 따라 단축/연장될 수 있습니다
• 점검 완료 후 정상 서비스가 제공됩니다

불편을 드려 죄송하며, 더 나은 서비스로 보답하겠습니다.

감사합니다.`,
    type: 'maintenance',
    status: 'published',
    isPinned: false,
    isImportant: true,
    isPopup: false,
    targetAudience: 'all',
    tags: ['점검', '정기점검', '시스템'],
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
  },

  // 6. 업데이트 공지
  {
    title: '📱 모바일 앱 업데이트 안내 (v2.5.0)',
    summary: '새로운 기능이 추가된 모바일 앱이 업데이트되었습니다.',
    content: `Youniqle 모바일 앱이 업데이트되었습니다.

📱 버전 2.5.0 업데이트 내용
━━━━━━━━━━━━━━━━━━
✨ 새로운 기능
• 다크모드 지원
• 알림 설정 세분화
• 상품 비교 기능 추가
• 위시리스트 공유 기능

🔧 개선사항
• 검색 속도 향상
• 결제 프로세스 간소화
• UI/UX 개선
• 앱 안정성 향상

🐛 버그 수정
• 장바구니 동기화 오류 수정
• 로그인 유지 문제 해결
• 이미지 로딩 오류 수정

📲 업데이트 방법
• iOS: App Store에서 업데이트
• Android: Google Play에서 업데이트

지금 바로 업데이트하고 새로운 기능을 만나보세요!

감사합니다.`,
    type: 'update',
    status: 'published',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'all',
    tags: ['업데이트', '모바일앱', '신기능'],
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
  },

  // 7. 일반 공지 - 배송 지연 안내
  {
    title: '추석 연휴 배송 일정 안내',
    summary: '추석 연휴 기간 동안의 배송 일정을 안내드립니다.',
    content: `안녕하세요, Youniqle입니다.

추석 명절을 맞아 배송 일정을 안내드립니다.

🚚 배송 일정
━━━━━━━━━━━━━━━━━━
• 연휴 전 주문 마감: 9월 25일 (월) 12:00
• 배송 휴무기간: 9월 28일 (목) ~ 10월 3일 (화)
• 정상 배송 재개: 10월 4일 (수)

📦 주문 관련 안내
• 9월 25일 12시 이후 주문
  → 10월 4일부터 순차 발송

• 9월 26일 ~ 10월 3일 주문
  → 10월 4일부터 순차 발송

⚠️ 유의사항
• 연휴 기간 중 고객센터 운영 중단
• 반품/교환 접수는 가능하나 처리는 연휴 이후
• 긴급 문의는 이메일(support@youniqle.com)로 부탁드립니다

즐거운 추석 명절 보내시기 바랍니다.

감사합니다.`,
    type: 'general',
    status: 'published',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'all',
    tags: ['배송', '추석', '연휴'],
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10일 전
  },

  // 8. 이벤트 - 리뷰 이벤트
  {
    title: '💬 포토 리뷰 작성 이벤트',
    summary: '구매 후기에 사진을 올리면 추가 포인트를 드립니다!',
    content: `Youniqle에서 포토 리뷰 이벤트를 진행합니다.

📸 이벤트 내용
━━━━━━━━━━━━━━━━━━
✅ 일반 리뷰: 500 포인트
✅ 포토 리뷰: 1,000 포인트
✅ 베스트 리뷰: 3,000 포인트 + 사은품

🎁 베스트 리뷰 선정 기준
• 고화질의 상품 사진 (3장 이상)
• 상세한 사용 후기 (100자 이상)
• 도움이 되는 정보 제공

📅 이벤트 기간
• 상시 진행

💡 참여 방법
1. 구매한 상품의 리뷰 작성
2. 상품 사진 3장 이상 업로드
3. 100자 이상의 후기 작성
4. 자동으로 포인트 적립

⚠️ 유의사항
• 포인트는 리뷰 승인 후 지급
• 타 사이트 도용 이미지는 삭제 및 포인트 회수
• 부적절한 내용 포함 시 삭제 처리

여러분의 소중한 후기를 기다립니다!

감사합니다.`,
    type: 'event',
    status: 'published',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'all',
    tags: ['이벤트', '리뷰', '포인트'],
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15일 전
  },

  // 9. 기존 회원 전용 공지
  {
    title: '🎉 기존 회원 감사 이벤트',
    summary: '기존 회원을 위한 특별한 감사 이벤트가 시작됩니다!',
    content: `안녕하세요, Youniqle입니다.

기존 회원 여러분께 감사 인사를 전합니다.

🎁 기존 회원 전용 혜택
━━━━━━━━━━━━━━━━━━
✅ 기존 회원 15% 할인 쿠폰
✅ VIP 회원 추가 혜택
✅ 장기 회원 특별 선물
✅ 생일 축하 쿠폰 (생일 당일 발급)

📅 이벤트 기간
• 2025년 10월 1일 ~ 12월 31일

💳 쿠폰 사용 방법
• 마이페이지 > 쿠폰함에서 확인
• 5만원 이상 구매 시 사용 가능
• 다른 할인과 중복 사용 불가

고객님들의 성원에 감사드립니다.`,
    type: 'event',
    status: 'published',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'existing',
    tags: ['기존회원', '감사', '이벤트'],
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4일 전
  },

  // 10. 파트너 전용 공지
  {
    title: '🤝 파트너 전용 업데이트 안내',
    summary: '파트너 전용 기능이 업데이트되었습니다. 새로운 기능들을 확인해보세요.',
    content: `안녕하세요, Youniqle 파트너 여러분.

파트너 전용 기능이 업데이트되었습니다.

🔄 업데이트 내용
━━━━━━━━━━━━━━━━━━
✨ 새로운 기능
• 파트너 대시보드 UI 개선
• 실시간 매출 분석 기능 추가
• 상품 등록 프로세스 간소화
• 파트너 전용 고객 지원 채널 오픈

🔧 개선사항
• 주문 처리 속도 향상
• 재고 관리 시스템 개선
• 정산 시스템 업데이트
• 알림 설정 세분화

📊 새로운 분석 도구
• 실시간 매출 현황
• 상품별 성과 분석
• 고객 구매 패턴 분석
• 경쟁사 가격 비교

자세한 내용은 파트너 센터에서 확인하실 수 있습니다.`,
    type: 'update',
    status: 'published',
    isPinned: false,
    isImportant: true,
    isPopup: false,
    targetAudience: 'partner',
    tags: ['파트너', '업데이트', '기능'],
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6일 전
  },

  // 11. 관리자 전용 공지
  {
    title: '⚙️ 관리자 전용 시스템 정책 변경 안내',
    summary: '관리자 전용 시스템 정책이 변경되었습니다. 새로운 정책을 확인해주세요.',
    content: `관리자 여러분께 안내드립니다.

시스템 관리 정책이 변경되었습니다.

📋 변경 사항
━━━━━━━━━━━━━━━━━━
🔐 보안 정책 강화
• 2단계 인증 필수화
• 세션 타임아웃 시간 단축 (30분)
• IP 화이트리스트 기능 추가

👥 권한 관리 개편
• 역할별 세분화된 권한 설정
• 임시 권한 부여 기능
• 권한 변경 이력 추적

📊 로그 관리 시스템 업데이트
• 실시간 활동 모니터링
• 의심스러운 활동 자동 감지
• 상세한 로그 분석 도구

⚠️ 주의사항
• 기존 권한 설정이 초기화될 수 있습니다
• 새로운 정책은 10월 15일부터 적용됩니다
• 관리자 매뉴얼을 반드시 확인해주세요

문의사항이 있으시면 시스템 관리자에게 연락주세요.`,
    type: 'general',
    status: 'published',
    isPinned: false,
    isImportant: false,
    isPopup: false,
    targetAudience: 'admin',
    tags: ['관리자', '정책', '변경'],
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8일 전
  },
];

async function createDemoNotices() {
  try {
    // 관리자 계정 찾기 (없으면 기본값 사용)
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️  관리자 계정을 찾을 수 없습니다. 기본 작성자 정보를 사용합니다.');
      adminUser = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Youniqle 관리자',
      };
    }

    console.log('📝 데모 공지사항 생성 중...');
    console.log(`✅ 작성자: ${adminUser.name}\n`);

    // 기존 데모 공지사항 삭제 (제목으로 확인)
    const demoTitles = demoNotices.map(n => n.title);
    const deleteResult = await Notice.deleteMany({ title: { $in: demoTitles } });
    console.log(`🗑️  기존 데모 공지사항 ${deleteResult.deletedCount}개 삭제\n`);

    // 새 공지사항 생성
    const createdNotices = [];
    for (const noticeData of demoNotices) {
      const notice = await Notice.create({
        ...noticeData,
        authorId: adminUser._id,
        authorName: adminUser.name,
      });
      createdNotices.push(notice);
      
      const pinned = notice.isPinned ? '📌 ' : '';
      const popup = notice.isPopup ? '🔔 ' : '';
      const important = notice.isImportant ? '⚠️  ' : '';
      console.log(`${pinned}${popup}${important}✅ ${notice.title}`);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✨ 총 ${createdNotices.length}개의 데모 공지사항 생성 완료!\n`);

    // 통계 출력
    const stats = {
      일반: createdNotices.filter(n => n.type === 'general').length,
      중요: createdNotices.filter(n => n.type === 'important').length,
      이벤트: createdNotices.filter(n => n.type === 'event').length,
      점검: createdNotices.filter(n => n.type === 'maintenance').length,
      업데이트: createdNotices.filter(n => n.type === 'update').length,
      고정: createdNotices.filter(n => n.isPinned).length,
      팝업: createdNotices.filter(n => n.isPopup).length,
    };

    console.log('📊 생성된 공지사항 통계:');
    console.log(`   일반 공지: ${stats.일반}개`);
    console.log(`   중요 공지: ${stats.중요}개`);
    console.log(`   이벤트: ${stats.이벤트}개`);
    console.log(`   점검 안내: ${stats.점검}개`);
    console.log(`   업데이트: ${stats.업데이트}개`);
    console.log(`   ────────────────`);
    console.log(`   상단 고정: ${stats.고정}개`);
    console.log(`   팝업 공지: ${stats.팝업}개`);

    console.log(`\n📱 테스트 방법:`);
    console.log(`   1. 사용자 페이지: http://localhost:3000/notices`);
    console.log(`   2. 관리자 페이지: http://localhost:3000/admin/notices`);
    console.log(`   3. 메인 페이지에서 팝업 확인: http://localhost:3000\n`);

  } catch (error) {
    console.error('❌ 데모 공지사항 생성 실패:', error);
    throw error;
  }
}

// 메인 실행
async function main() {
  try {
    await connectDB();
    await createDemoNotices();
    console.log('✅ 모든 작업 완료!');
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
    process.exit(0);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { createDemoNotices };


