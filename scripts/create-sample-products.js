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

// Product 스키마 정의
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  status: { type: String, enum: ['active', 'hidden', 'out_of_stock'], default: 'active' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  featured: { type: Boolean, default: false },
  featuredByAdmin: { type: Boolean, default: false },
  adminRecommendationReason: { type: String },
  images: [{
    url: { type: String, required: true },
    w: { type: Number },
    h: { type: Number },
    type: { type: String }
  }],
  summary: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// 샘플 상품 데이터
const sampleProducts = [
  {
    name: "프리미엄 유기농 꿀",
    slug: "premium-organic-honey",
    price: 25000,
    originalPrice: 30000,
    stock: 50,
    category: "식품",
    featured: true,
    featuredByAdmin: true,
    adminRecommendationReason: "신규 사용자에게 추천하는 대표 상품",
    images: [{ url: "https://images.unsplash.com/photo-1587049352846-4a222e784d4f?w=400", w: 400, h: 400 }],
    summary: "100% 유기농 꿀로 만든 프리미엄 꿀",
    description: "자연 그대로의 달콤함을 담은 유기농 꿀입니다. 벌꿀의 영양소를 그대로 보존하여 건강한 일상을 도와드립니다."
  },
  {
    name: "아로마 디퓨저 세트",
    slug: "aroma-diffuser-set",
    price: 45000,
    originalPrice: 55000,
    stock: 30,
    category: "홈리빙",
    featured: true,
    featuredByAdmin: true,
    adminRecommendationReason: "인기 홈리빙 상품",
    images: [{ url: "https://images.unsplash.com/photo-1607853202273-797f1c22a38f?w=400", w: 400, h: 400 }],
    summary: "우아한 디자인의 아로마 디퓨저와 에센셜 오일 세트",
    description: "집안을 향긋하게 만들어주는 아로마 디퓨저입니다. 스트레스 해소와 집중력 향상에 도움이 됩니다."
  },
  {
    name: "무지 티셔츠 3팩",
    slug: "basic-t-shirt-3pack",
    price: 35000,
    originalPrice: 45000,
    stock: 100,
    category: "패션",
    featured: true,
    featuredByAdmin: true,
    adminRecommendationReason: "기본템 추천 상품",
    images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", w: 400, h: 400 }],
    summary: "편안한 착용감의 기본 무지 티셔츠 3팩",
    description: "어떤 옷과도 잘 어울리는 기본 티셔츠입니다. 100% 면 소재로 부드럽고 편안합니다."
  },
  {
    name: "블루투스 이어폰",
    slug: "bluetooth-earphones",
    price: 89000,
    originalPrice: 120000,
    stock: 25,
    category: "전자제품",
    featured: false,
    featuredByAdmin: false,
    images: [{ url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", w: 400, h: 400 }],
    summary: "고음질 무선 블루투스 이어폰",
    description: "노이즈 캔슬링 기능이 있는 고음질 블루투스 이어폰입니다. 최대 30시간 재생 가능합니다."
  },
  {
    name: "천연 비누 5개 세트",
    slug: "natural-soap-5pack",
    price: 18000,
    originalPrice: 25000,
    stock: 40,
    category: "뷰티",
    featured: false,
    featuredByAdmin: false,
    images: [{ url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", w: 400, h: 400 }],
    summary: "천연 재료로 만든 수제 비누 5개 세트",
    description: "자연 친화적 재료로 만든 수제 비누입니다. 피부에 자극이 적고 보습 효과가 뛰어납니다."
  },
  {
    name: "스테인리스 텀블러",
    slug: "stainless-tumbler",
    price: 32000,
    originalPrice: 40000,
    stock: 60,
    category: "홈리빙",
    featured: false,
    featuredByAdmin: false,
    images: [{ url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", w: 400, h: 400 }],
    summary: "보온 보냉이 뛰어난 스테인리스 텀블러",
    description: "12시간 보온, 24시간 보냉이 가능한 스테인리스 텀블러입니다. 환경을 생각하는 일회용 컵 대체용으로 추천합니다."
  },
  {
    name: "오가닉 코튼 시트",
    slug: "organic-cotton-sheet",
    price: 75000,
    originalPrice: 95000,
    stock: 20,
    category: "홈리빙",
    featured: false,
    featuredByAdmin: false,
    images: [{ url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", w: 400, h: 400 }],
    summary: "100% 유기농 코튼으로 만든 침구 세트",
    description: "부드럽고 통기성이 좋은 유기농 코튼 시트입니다. 알레르기 없는 안전한 소재로 제작되었습니다."
  },
  {
    name: "헤드폰 스탠드",
    slug: "headphone-stand",
    price: 15000,
    originalPrice: 20000,
    stock: 35,
    category: "홈리빙",
    featured: false,
    featuredByAdmin: false,
    images: [{ url: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400", w: 400, h: 400 }],
    summary: "우드 소재의 세련된 헤드폰 스탠드",
    description: "데스크를 깔끔하게 정리해주는 우드 헤드폰 스탠드입니다. 내구성이 뛰어나고 디자인이 세련됩니다."
  }
];

// 샘플 데이터 생성 함수
const createSampleProducts = async () => {
  try {
    await connectDB();
    
    // 기존 상품 삭제
    await Product.deleteMany({});
    console.log('기존 상품 데이터 삭제 완료');
    
    // 샘플 상품 생성
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = new Product(sampleProducts[i]);
      await product.save();
      console.log(`상품 ${i + 1} 생성 완료: ${product.name}`);
    }
    
    console.log('샘플 상품 데이터 생성 완료!');
    console.log(`총 ${sampleProducts.length}개의 상품이 생성되었습니다.`);
    
    // 관리자 추천 상품 개수 확인
    const adminRecommended = await Product.countDocuments({ featuredByAdmin: true });
    console.log(`관리자 추천 상품: ${adminRecommended}개`);
    
  } catch (error) {
    console.error('샘플 데이터 생성 중 오류:', error);
  } finally {
    mongoose.connection.close();
  }
};

// 스크립트 실행
createSampleProducts();
