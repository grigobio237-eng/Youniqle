import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '@/models/Product';
import { slugify } from '@/lib/utils';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

const sampleProducts = [
  {
    name: '프리미엄 면 티셔츠',
    price: 29900,
    stock: 100,
    category: 'clothing',
    summary: '부드럽고 편안한 면 소재의 기본 티셔츠',
    description: '고급 면 소재로 제작된 프리미엄 티셔츠입니다. 부드러운 촉감과 뛰어난 통기성으로 하루 종일 편안하게 착용할 수 있습니다. 다양한 색상으로 제공되며, 기본부터 캐주얼까지 다양한 스타일에 매칭됩니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '스포츠 러닝화',
    price: 129000,
    stock: 50,
    category: 'shoes',
    summary: '가벼우면서도 쿠셔닝이 뛰어난 러닝화',
    description: '최신 기술이 적용된 스포츠 러닝화입니다. 가벼운 무게와 뛰어난 쿠셔닝으로 장시간 운동에도 편안함을 제공합니다. 메쉬 소재로 통기성이 우수하며, 다양한 발 크기에 맞는 사이즈를 제공합니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '가죽 백팩',
    price: 189000,
    stock: 30,
    category: 'bags',
    summary: '고급 가죽 소재의 실용적인 백팩',
    description: '프리미엄 가죽으로 제작된 백팩입니다. 내구성이 뛰어나고 스타일리시한 디자인으로 데일리룩부터 비즈니스룩까지 다양한 상황에서 활용할 수 있습니다. 넉넉한 수납공간과 편리한 포켓 배치로 실용성을 극대화했습니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '스마트워치',
    price: 299000,
    stock: 25,
    category: 'electronics',
    summary: '건강 관리와 스마트 기능을 갖춘 웨어러블 디바이스',
    description: '최신 기술이 적용된 스마트워치입니다. 심박수 측정, 걸음 수 카운트, 수면 분석 등 건강 관리 기능과 알림, 음악 재생 등 스마트 기능을 모두 갖추고 있습니다. 방수 기능으로 일상생활과 운동 모두에서 안전하게 사용할 수 있습니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '블루투스 이어폰',
    price: 89000,
    stock: 75,
    category: 'electronics',
    summary: '무선 자유로움과 고음질을 동시에',
    description: '최신 블루투스 기술을 적용한 무선 이어폰입니다. 노이즈 캔슬링 기능으로 깨끗한 사운드를 제공하며, 최대 8시간 연속 재생이 가능합니다. 컴팩트한 디자인과 안정적인 착용감으로 운동과 일상생활 모두에서 편리하게 사용할 수 있습니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '세련된 시계',
    price: 159000,
    stock: 40,
    category: 'accessories',
    summary: '클래식한 디자인의 고급 시계',
    description: '전통적인 시계 제작 기술과 현대적인 디자인이 조화를 이룬 세련된 시계입니다. 스테인리스 스틸 케이스와 가죽 스트랩으로 내구성과 편안함을 모두 갖추었습니다. 정확한 시간 표시와 우아한 외관으로 어떤 스타일에도 잘 어울립니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523170335258-f5c8d3a8b5a7?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '유기농 토마토',
    price: 8900,
    stock: 100,
    category: 'fresh-food',
    summary: '신선하고 달콤한 유기농 토마토',
    description: '자연 그대로의 맛을 담은 유기농 토마토입니다. 화학비료와 농약을 사용하지 않고 재배하여 안전하고 건강합니다. 달콤하고 신선한 맛으로 샐러드, 요리, 주스 등 다양한 용도로 활용할 수 있습니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '신선한 바나나',
    price: 4900,
    stock: 150,
    category: 'fresh-food',
    summary: '달콤하고 부드러운 신선한 바나나',
    description: '완전히 익은 달콤한 바나나로 비타민과 미네랄이 풍부합니다. 간식으로 드시거나 스무디, 케이크 등 다양한 요리에 활용할 수 있습니다. 신선한 상태로 배송되어 최상의 맛을 경험하실 수 있습니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  },
  {
    name: '프리미엄 한우 등심',
    price: 45000,
    stock: 20,
    category: 'fresh-food',
    summary: '최고급 한우 등심 스테이크',
    description: '최고급 한우에서 나온 프리미엄 등심입니다. 부드럽고 풍부한 맛이 특징이며, 스테이크나 샤부샤부 등 다양한 요리로 즐기실 수 있습니다. 신선한 상태로 포장하여 배송되며, 냉장 보관하여 드시기 바랍니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop',
        w: 1000,
        h: 1000,
        type: 'image/jpeg'
      }
    ]
  }
];

async function seedProducts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🗑️ Clearing existing products...');
    await Product.deleteMany({});
    
    console.log('📦 Adding sample products...');
    for (const productData of sampleProducts) {
      const slug = slugify(productData.name);
      console.log(`Creating product: ${productData.name} -> slug: ${slug}`);
      
      const product = new Product({
        ...productData,
        slug: slug,
        status: 'active'
      });
      
      await product.save();
      console.log(`✅ Added: ${product.name} (slug: ${product.slug})`);
    }
    
    console.log('🎉 Product seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
