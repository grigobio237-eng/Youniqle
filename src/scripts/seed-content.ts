import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Content from '@/models/Content';

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

const sampleContent = [
  {
    title: "Youniqle 신상품 소개 - 프리미엄 한우",
    description: "최고급 한우 등심의 특징과 조리법을 소개하는 영상입니다. 신선한 재료의 중요성과 올바른 보관법까지 알려드립니다.",
    platform: "youtube",
    url: "https://youtube.com/watch?v=example1",
    thumbnail: "/character/youniqle-1.png",
    views: 12500,
    likes: 1200,
    publishedAt: new Date("2024-01-15"),
    tags: ["한우", "프리미엄", "요리", "신상품"],
    category: "제품소개",
    featured: true
  },
  {
    title: "프리미엄 한우 요리법 - 틱톡",
    description: "30초 만에 배우는 한우 스테이크 조리법! 간단하지만 맛있는 요리 비법을 공유합니다.",
    platform: "tiktok",
    url: "https://tiktok.com/@youniqle/video/example2",
    thumbnail: "/character/youniqle-2.png",
    views: 8700,
    likes: 856,
    publishedAt: new Date("2024-01-14"),
    tags: ["한우", "요리법", "스테이크", "간단요리"],
    category: "요리법",
    featured: true
  },
  {
    title: "유기농 토마토 재배기 - 블로그",
    description: "유기농 토마토의 재배 과정과 농가의 이야기를 담은 상세한 블로그 포스트입니다.",
    platform: "blog",
    url: "https://blog.youniqle.com/organic-tomato",
    thumbnail: "/character/youniqle-3.png",
    views: 5300,
    likes: 234,
    publishedAt: new Date("2024-01-13"),
    tags: ["유기농", "토마토", "재배", "농가"],
    category: "농업스토리",
    featured: false
  },
  {
    title: "스포츠웨어 착용법 - 유튜브",
    description: "운동할 때 올바른 스포츠웨어 착용법과 관리법을 알려드립니다.",
    platform: "youtube",
    url: "https://youtube.com/watch?v=example4",
    thumbnail: "/character/youniqle-4.png",
    views: 15200,
    likes: 2100,
    publishedAt: new Date("2024-01-12"),
    tags: ["스포츠웨어", "운동", "착용법", "관리법"],
    category: "라이프스타일",
    featured: true
  },
  {
    title: "신선식품 보관법 - 틱톡",
    description: "신선식품을 오래 보관하는 비법을 짧고 재미있게 소개합니다.",
    platform: "tiktok",
    url: "https://tiktok.com/@youniqle/video/example5",
    thumbnail: "/character/youniqle-5.png",
    views: 9800,
    likes: 1500,
    publishedAt: new Date("2024-01-11"),
    tags: ["신선식품", "보관법", "냉장고", "팁"],
    category: "라이프스타일",
    featured: false
  },
  {
    title: "Youniqle 브랜드 스토리 - 블로그",
    description: "Youniqle이 추구하는 가치와 브랜드 철학에 대한 깊이 있는 이야기입니다.",
    platform: "blog",
    url: "https://blog.youniqle.com/brand-story",
    thumbnail: "/character/youniqle-6.png",
    views: 7400,
    likes: 456,
    publishedAt: new Date("2024-01-10"),
    tags: ["브랜드", "스토리", "가치", "철학"],
    category: "브랜드",
    featured: true
  },
  {
    title: "바나나 스무디 만들기 - 인스타그램",
    description: "신선한 바나나로 만드는 건강한 스무디 레시피를 소개합니다.",
    platform: "instagram",
    url: "https://instagram.com/p/example7",
    thumbnail: "/character/youniqle-1.png",
    views: 6200,
    likes: 890,
    publishedAt: new Date("2024-01-09"),
    tags: ["바나나", "스무디", "레시피", "건강"],
    category: "레시피",
    featured: false
  },
  {
    title: "패션 트렌드 2024 - 페이스북",
    description: "2024년 패션 트렌드와 Youniqle의 새로운 컬렉션을 소개합니다.",
    platform: "facebook",
    url: "https://facebook.com/youniqle/posts/example8",
    thumbnail: "/character/youniqle-2.png",
    views: 8900,
    likes: 567,
    publishedAt: new Date("2024-01-08"),
    tags: ["패션", "트렌드", "2024", "컬렉션"],
    category: "패션",
    featured: false
  }
];

async function seedContent() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log('🗑️ Clearing existing content...');
    await Content.deleteMany({});

    console.log('📦 Adding sample content...');
    for (const contentData of sampleContent) {
      const content = new Content(contentData);
      await content.save();
      console.log(`✅ Added: ${content.title} (${content.platform})`);
    }

    console.log('🎉 Content seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding content:', error);
    process.exit(1);
  }
}

seedContent();

