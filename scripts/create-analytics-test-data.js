const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youniqle');
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// AnalyticsEvent 스키마 정의
const AnalyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['page_view', 'click', 'conversion', 'purchase', 'email_open', 'email_click', 'newsletter_subscribe', 'newsletter_unsubscribe', 'coupon_use', 'promotion_view', 'ab_test_view', 'ab_test_conversion', 'search', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'checkout_complete', 'custom'],
    required: true
  },
  eventCategory: {
    type: String,
    enum: ['marketing', 'ecommerce', 'user_behavior', 'system', 'ab_test'],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  
  eventData: {
    pageUrl: { type: String },
    pageTitle: { type: String },
    referrer: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmTerm: { type: String },
    utmContent: { type: String },
    clickElement: { type: String },
    clickText: { type: String },
    clickUrl: { type: String },
    clickPosition: {
      x: { type: Number },
      y: { type: Number }
    },
    conversionValue: { type: Number },
    conversionCurrency: { type: String },
    conversionType: { type: String },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    productCategory: { type: String },
    productPrice: { type: Number },
    quantity: { type: Number },
    totalAmount: { type: Number },
    emailId: { type: String },
    emailSubject: { type: String },
    emailCampaign: { type: String },
    emailTemplate: { type: String },
    newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Newsletter' },
    newsletterName: { type: String },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    discountAmount: { type: Number },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
    promotionName: { type: String },
    promotionType: { type: String },
    abTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ABTest' },
    abTestName: { type: String },
    variantName: { type: String },
    searchQuery: { type: String },
    searchResults: { type: Number },
    searchFilters: { type: mongoose.Schema.Types.Mixed },
    cartId: { type: String },
    cartItems: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String },
      quantity: { type: Number },
      price: { type: Number }
    }],
    checkoutStep: { type: String },
    paymentMethod: { type: String },
    shippingMethod: { type: String },
    customData: { type: mongoose.Schema.Types.Mixed }
  },
  
  userInfo: {
    isLoggedIn: { type: Boolean, default: false },
    userType: { type: String, enum: ['guest', 'user', 'partner', 'admin'] },
    registrationDate: { type: Date },
    lastLoginDate: { type: Date },
    totalSpent: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    segmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSegment' }]
  },
  
  deviceInfo: {
    userAgent: { type: String, required: true },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      required: true
    },
    browser: { type: String },
    browserVersion: { type: String },
    os: { type: String },
    osVersion: { type: String },
    screenResolution: { type: String },
    viewportSize: { type: String },
    language: { type: String },
    timezone: { type: String }
  },
  
  locationInfo: {
    ipAddress: { type: String, required: true },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  performanceInfo: {
    pageLoadTime: { type: Number },
    domContentLoadedTime: { type: Number },
    firstContentfulPaint: { type: Number },
    largestContentfulPaint: { type: Number },
    firstInputDelay: { type: Number },
    cumulativeLayoutShift: { type: Number }
  },
  
  marketingInfo: {
    campaignId: { type: String },
    campaignName: { type: String },
    adGroupId: { type: String },
    adGroupName: { type: String },
    keyword: { type: String },
    creativeId: { type: String },
    placementId: { type: String },
    network: { type: String }
  },
  
  sessionInfo: {
    sessionStartTime: { type: Date, required: true },
    sessionDuration: { type: Number },
    pageViews: { type: Number, default: 1 },
    events: { type: Number, default: 1 },
    isNewSession: { type: Boolean, default: true },
    isBounce: { type: Boolean, default: false },
    exitPage: { type: String }
  },
  
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile_app', 'api', 'email', 'sms', 'push'],
      default: 'web'
    },
    version: { type: String, default: '1.0.0' },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production'
    },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

// 테스트 데이터 생성
const createTestData = async () => {
  try {
    console.log('기존 분석 데이터 삭제 중...');
    await AnalyticsEvent.deleteMany({});
    
    console.log('테스트 분석 데이터 생성 중...');
    
    const events = [];
    const now = new Date();
    const eventTypes = ['page_view', 'click', 'conversion', 'purchase', 'search', 'add_to_cart'];
    const eventCategories = ['marketing', 'ecommerce', 'user_behavior'];
    const deviceTypes = ['desktop', 'mobile', 'tablet'];
    const countries = ['KR', 'US', 'JP', 'CN', 'GB'];
    const utmSources = ['google', 'facebook', 'naver', 'kakao', 'direct'];
    const utmMediums = ['cpc', 'organic', 'social', 'email', 'referral'];
    const utmCampaigns = ['summer_sale', 'new_user', 'product_launch', 'black_friday', 'christmas'];
    
    // 최근 7일간의 데이터 생성
    for (let day = 0; day < 7; day++) {
      const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      
      // 하루에 100-500개의 이벤트 생성
      const eventsPerDay = Math.floor(Math.random() * 400) + 100;
      
      for (let i = 0; i < eventsPerDay; i++) {
        const eventTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const utmSource = utmSources[Math.floor(Math.random() * utmSources.length)];
        const utmMedium = utmMediums[Math.floor(Math.random() * utmMediums.length)];
        const utmCampaign = utmCampaigns[Math.floor(Math.random() * utmCampaigns.length)];
        
        const event = {
          eventType,
          eventCategory: eventCategories[Math.floor(Math.random() * eventCategories.length)],
          userId: new mongoose.Types.ObjectId(),
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: eventTime,
          
          eventData: {
            pageUrl: `https://youniqle.com/${eventType === 'page_view' ? 'products' : 'home'}`,
            pageTitle: eventType === 'page_view' ? '제품 목록' : '홈페이지',
            referrer: utmSource === 'direct' ? null : `https://${utmSource}.com`,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm: eventType === 'search' ? '검색어' : null,
            utmContent: eventType === 'click' ? '배너' : null,
            clickElement: eventType === 'click' ? 'button' : null,
            clickText: eventType === 'click' ? '구매하기' : null,
            clickUrl: eventType === 'click' ? 'https://youniqle.com/checkout' : null,
            clickPosition: eventType === 'click' ? { x: Math.random() * 1920, y: Math.random() * 1080 } : null,
            conversionValue: eventType === 'conversion' ? Math.floor(Math.random() * 100000) + 10000 : null,
            conversionCurrency: eventType === 'conversion' ? 'KRW' : null,
            conversionType: eventType === 'conversion' ? 'purchase' : null,
            orderId: eventType === 'purchase' ? new mongoose.Types.ObjectId() : null,
            productId: eventType === 'purchase' ? new mongoose.Types.ObjectId() : null,
            productName: eventType === 'purchase' ? '테스트 제품' : null,
            productCategory: eventType === 'purchase' ? '전자제품' : null,
            productPrice: eventType === 'purchase' ? Math.floor(Math.random() * 50000) + 10000 : null,
            quantity: eventType === 'purchase' ? Math.floor(Math.random() * 3) + 1 : null,
            totalAmount: eventType === 'purchase' ? Math.floor(Math.random() * 100000) + 10000 : null,
            searchQuery: eventType === 'search' ? '검색어' : null,
            searchResults: eventType === 'search' ? Math.floor(Math.random() * 100) + 10 : null,
            cartId: eventType === 'add_to_cart' ? `cart_${Math.random().toString(36).substr(2, 9)}` : null,
            cartItems: eventType === 'add_to_cart' ? [{
              productId: new mongoose.Types.ObjectId(),
              productName: '테스트 제품',
              quantity: 1,
              price: 25000
            }] : null,
            checkoutStep: eventType === 'checkout_start' ? 'payment' : null,
            paymentMethod: eventType === 'checkout_start' ? 'card' : null,
            shippingMethod: eventType === 'checkout_start' ? 'standard' : null
          },
          
          userInfo: {
            isLoggedIn: Math.random() > 0.3,
            userType: Math.random() > 0.8 ? 'partner' : 'user',
            registrationDate: new Date(eventTime.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            lastLoginDate: new Date(eventTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            totalSpent: Math.floor(Math.random() * 500000) + 10000,
            orderCount: Math.floor(Math.random() * 20) + 1,
            segmentIds: []
          },
          
          deviceInfo: {
            userAgent: deviceType === 'mobile' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            deviceType,
            browser: deviceType === 'mobile' ? 'Safari' : 'Chrome',
            browserVersion: '14.0',
            os: deviceType === 'mobile' ? 'iOS' : 'Windows',
            osVersion: '10.0',
            screenResolution: deviceType === 'mobile' ? '375x667' : '1920x1080',
            viewportSize: deviceType === 'mobile' ? '375x667' : '1920x1080',
            language: 'ko-KR',
            timezone: 'Asia/Seoul'
          },
          
          locationInfo: {
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            country,
            region: country === 'KR' ? 'Seoul' : 'California',
            city: country === 'KR' ? 'Seoul' : 'Los Angeles',
            latitude: country === 'KR' ? 37.5665 : 34.0522,
            longitude: country === 'KR' ? 126.9780 : -118.2437
          },
          
          performanceInfo: {
            pageLoadTime: Math.random() * 3000 + 500,
            domContentLoadedTime: Math.random() * 2000 + 300,
            firstContentfulPaint: Math.random() * 1500 + 200,
            largestContentfulPaint: Math.random() * 2500 + 500,
            firstInputDelay: Math.random() * 100 + 10,
            cumulativeLayoutShift: Math.random() * 0.1
          },
          
          marketingInfo: {
            campaignId: `campaign_${Math.random().toString(36).substr(2, 9)}`,
            campaignName: utmCampaign,
            adGroupId: `adgroup_${Math.random().toString(36).substr(2, 9)}`,
            adGroupName: `${utmCampaign}_adgroup`,
            keyword: eventType === 'search' ? '검색어' : null,
            creativeId: `creative_${Math.random().toString(36).substr(2, 9)}`,
            placementId: `placement_${Math.random().toString(36).substr(2, 9)}`,
            network: utmSource
          },
          
          sessionInfo: {
            sessionStartTime: new Date(eventTime.getTime() - Math.random() * 3600000),
            sessionDuration: Math.random() * 1800000 + 300000,
            pageViews: Math.floor(Math.random() * 10) + 1,
            events: Math.floor(Math.random() * 20) + 1,
            isNewSession: Math.random() > 0.7,
            isBounce: Math.random() > 0.8,
            exitPage: `https://youniqle.com/${eventType === 'page_view' ? 'products' : 'home'}`
          },
          
          metadata: {
            source: 'web',
            version: '1.0.0',
            environment: 'production',
            processed: false,
            processedAt: null
          }
        };
        
        events.push(event);
      }
    }
    
    console.log(`${events.length}개의 분석 이벤트 생성 중...`);
    await AnalyticsEvent.insertMany(events);
    
    console.log('✅ 테스트 분석 데이터 생성 완료!');
    console.log(`📊 총 ${events.length}개의 이벤트가 생성되었습니다.`);
    
  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
  }
};

// 메인 실행
const main = async () => {
  try {
    await connectDB();
    await createTestData();
    process.exit(0);
  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  }
};

main();








