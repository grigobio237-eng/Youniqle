const mongoose = require('mongoose');
const dbConnect = require('../src/lib/db').default;
const Shop = require('../src/models/Shop').default;
const SurveyResponse = require('../src/models/SurveyResponse').default;
const User = require('../src/models/User').default;

async function seedTestData() {
  await dbConnect();
  
  // 1. Find or create a navigator
  let navigator = await User.findOne({ isNavigator: true });
  if (!navigator) {
    console.log("No navigator found. Please create one first.");
    process.exit(1);
  }

  // 2. Create a test shop
  const shop = new Shop({
    name: "강남 힐링 에스테틱",
    shopCode: "TEST01",
    navigatorId: navigator._id,
    category: "beauty"
  });
  await shop.save();
  console.log("Created Shop:", shop.name, shop.shopCode);

  // 3. Create mock survey responses
  const stressOptions = ['피부가 갑자기 칙칙해졌다', '얼굴 붓기가 잘 안 빠진다', '탄력이 떨어지고 라인이 무너진다', '자고 일어나도 피곤하다'];
  const budgetOptions = ['10만원 미만', '10만 ~ 30만원', '30만 ~ 70만원'];

  for (let i = 0; i < 15; i++) {
    const response = new SurveyResponse({
      shopId: shop._id,
      navigatorId: navigator._id,
      shopCode: shop.shopCode,
      answers: {
        stressPoint: stressOptions[Math.floor(Math.random() * stressOptions.length)],
        priority: '피부톤, 광채',
        interestArea: '피부 관리, 레이저, 스킨부스터',
        disappointment: '잠깐 좋아지고 다시 무너진다',
        startMethod: '1회 체험',
        benefitPreference: '회원 전용 혜택가',
        budget: budgetOptions[Math.floor(Math.random() * budgetOptions.length)],
        highEndCondition: '확실한 변화 확인',
        desiredCombination: '피부 + 회복관리',
        entryCondition: '이번 달 한정 혜택이 있다면'
      },
      status: 'new'
    });
    await response.save();
  }
  
  console.log("Seeded 15 survey responses.");
  process.exit(0);
}

seedTestData();
