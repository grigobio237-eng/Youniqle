require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  console.log('📝 .env.local 파일에 MONGODB_URI를 설정해주세요.');
  process.exit(1);
}

// Product 스키마 정의
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }
  }],
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String },
  sku: { type: String, unique: true },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  specifications: { type: mongoose.Schema.Types.Mixed },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number }
  },
  shipping: {
    free: { type: Boolean, default: false },
    cost: { type: Number, default: 0 },
    estimatedDays: { type: Number, default: 3 }
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// 테스트 상품 데이터
const testProducts = [
  {
    name: "프리미엄 무선 이어폰",
    slug: "premium-wireless-earphones",
    description: "고품질 사운드와 편안한 착용감을 제공하는 무선 이어폰입니다. 노이즈 캔슬링 기능과 24시간 배터리 수명을 자랑합니다.",
    price: 129000,
    originalPrice: 159000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        alt: "무선 이어폰"
      },
      {
        url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop",
        alt: "무선 이어폰 사이드뷰"
      }
    ],
    category: "전자제품",
    subcategory: "오디오",
    brand: "SoundMax",
    sku: "SM-WE001",
    stock: 50,
    status: "active",
    featured: true,
    tags: ["무선", "이어폰", "노이즈캔슬링", "프리미엄"],
    specifications: {
      "배터리 수명": "24시간",
      "충전 시간": "2시간",
      "연결 방식": "블루투스 5.0",
      "방수 등급": "IPX7"
    },
    dimensions: {
      length: 6.5,
      width: 4.2,
      height: 2.8,
      weight: 45
    },
    shipping: {
      free: true,
      cost: 0,
      estimatedDays: 2
    },
    seo: {
      title: "프리미엄 무선 이어폰 - 고품질 사운드",
      description: "노이즈 캔슬링 기능이 있는 프리미엄 무선 이어폰",
      keywords: ["무선이어폰", "노이즈캔슬링", "블루투스", "오디오"]
    }
  },
  {
    name: "스마트 워치 Pro",
    slug: "smart-watch-pro",
    description: "건강 관리와 스마트 기능을 모두 갖춘 프리미엄 스마트워치입니다. 24시간 심박수 모니터링과 GPS 기능을 지원합니다.",
    price: 299000,
    originalPrice: 349000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
        alt: "스마트워치"
      },
      {
        url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop",
        alt: "스마트워치 착용샷"
      }
    ],
    category: "전자제품",
    subcategory: "웨어러블",
    brand: "TechWear",
    sku: "TW-SW001",
    stock: 30,
    status: "active",
    featured: true,
    tags: ["스마트워치", "건강관리", "GPS", "프리미엄"],
    specifications: {
      "화면 크기": "1.4인치",
      "배터리 수명": "7일",
      "방수 등급": "5ATM",
      "센서": "심박수, GPS, 가속도계"
    },
    dimensions: {
      length: 4.4,
      width: 3.6,
      height: 1.2,
      weight: 38
    },
    shipping: {
      free: true,
      cost: 0,
      estimatedDays: 3
    },
    seo: {
      title: "스마트 워치 Pro - 건강 관리와 스마트 기능",
      description: "24시간 심박수 모니터링이 가능한 프리미엄 스마트워치",
      keywords: ["스마트워치", "건강관리", "GPS", "웨어러블"]
    }
  },
  {
    name: "무선 충전기 스탠드",
    slug: "wireless-charger-stand",
    description: "스마트폰과 이어폰을 동시에 충전할 수 있는 무선 충전 스탠드입니다. 세련된 디자인과 안전한 충전을 보장합니다.",
    price: 89000,
    originalPrice: 119000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
        alt: "무선 충전기"
      },
      {
        url: "https://images.unsplash.com/photo-1609091839311-d5365f0b4b0a?w=500&h=500&fit=crop",
        alt: "무선 충전기 사용샷"
      }
    ],
    category: "전자제품",
    subcategory: "충전기",
    brand: "ChargeTech",
    sku: "CT-WC001",
    stock: 75,
    status: "active",
    featured: false,
    tags: ["무선충전", "스탠드", "멀티충전", "스마트폰"],
    specifications: {
      "출력": "15W",
      "충전 방식": "Qi 무선충전",
      "동시 충전": "2개 기기",
      "케이블": "USB-C"
    },
    dimensions: {
      length: 12.5,
      width: 8.0,
      height: 3.5,
      weight: 320
    },
    shipping: {
      free: false,
      cost: 3000,
      estimatedDays: 2
    },
    seo: {
      title: "무선 충전기 스탠드 - 멀티 충전",
      description: "스마트폰과 이어폰을 동시에 충전하는 무선 충전 스탠드",
      keywords: ["무선충전", "스탠드", "멀티충전", "스마트폰"]
    }
  },
  {
    name: "블루투스 스피커",
    slug: "bluetooth-speaker",
    description: "강력한 사운드와 긴 배터리 수명을 자랑하는 휴대용 블루투스 스피커입니다. 방수 기능과 LED 조명이 포함되어 있습니다.",
    price: 159000,
    originalPrice: 199000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
        alt: "블루투스 스피커"
      },
      {
        url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
        alt: "블루투스 스피커 사이드뷰"
      }
    ],
    category: "전자제품",
    subcategory: "오디오",
    brand: "SoundWave",
    sku: "SW-BS001",
    stock: 40,
    status: "active",
    featured: true,
    tags: ["블루투스", "스피커", "휴대용", "방수", "LED"],
    specifications: {
      "출력": "20W",
      "배터리 수명": "12시간",
      "방수 등급": "IPX7",
      "연결": "블루투스 5.0"
    },
    dimensions: {
      length: 20.0,
      width: 8.5,
      height: 8.5,
      weight: 850
    },
    shipping: {
      free: true,
      cost: 0,
      estimatedDays: 2
    },
    seo: {
      title: "블루투스 스피커 - 강력한 사운드와 방수 기능",
      description: "20W 출력과 12시간 배터리 수명의 휴대용 블루투스 스피커",
      keywords: ["블루투스스피커", "휴대용", "방수", "LED", "강력한사운드"]
    }
  },
  {
    name: "USB-C 허브",
    slug: "usb-c-hub",
    description: "노트북의 USB-C 포트를 확장하여 다양한 기기를 연결할 수 있는 멀티포트 허브입니다. HDMI, USB, SD카드 슬롯을 제공합니다.",
    price: 79000,
    originalPrice: 99000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=500&fit=crop",
        alt: "USB-C 허브"
      },
      {
        url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=500&fit=crop",
        alt: "USB-C 허브 연결샷"
      }
    ],
    category: "전자제품",
    subcategory: "액세서리",
    brand: "PortHub",
    sku: "PH-UH001",
    stock: 60,
    status: "active",
    featured: false,
    tags: ["USB-C", "허브", "멀티포트", "노트북", "확장"],
    specifications: {
      "포트": "USB-C, USB 3.0 x2, HDMI, SD카드",
      "전원": "USB-C PD",
      "크기": "컴팩트",
      "호환성": "MacBook, Windows 노트북"
    },
    dimensions: {
      length: 10.5,
      width: 4.2,
      height: 1.5,
      weight: 85
    },
    shipping: {
      free: false,
      cost: 2500,
      estimatedDays: 2
    },
    seo: {
      title: "USB-C 허브 - 멀티포트 확장",
      description: "노트북의 USB-C 포트를 확장하는 멀티포트 허브",
      keywords: ["USB-C허브", "멀티포트", "노트북", "확장", "HDMI"]
    }
  }
];

async function createProductTestData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 테스트 상품 삭제
    console.log('🗑️ 기존 테스트 상품 삭제 중...');
    await Product.deleteMany({
      sku: { $in: testProducts.map(p => p.sku) }
    });
    console.log('✅ 기존 테스트 상품 삭제 완료');

    // 테스트 상품 생성
    console.log('📦 테스트 상품 생성 중...');
    const products = await Product.insertMany(testProducts);
    console.log(`✅ ${products.length}개의 테스트 상품 생성 완료`);

    console.log('\n🎉 상품 테스트 데이터 생성 완료!');
    console.log('\n📋 생성된 상품 목록:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   가격: ${product.price.toLocaleString()}원 (원가: ${product.originalPrice?.toLocaleString()}원)`);
      console.log(`   카테고리: ${product.category} > ${product.subcategory}`);
      console.log(`   브랜드: ${product.brand}`);
      console.log(`   재고: ${product.stock}개`);
      console.log(`   SKU: ${product.sku}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 이제 상품 목록 페이지에서 확인할 수 있습니다!');

  } catch (error) {
    console.error('❌ 상품 테스트 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  createProductTestData();
}

module.exports = createProductTestData;
