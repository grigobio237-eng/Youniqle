require('dotenv').config({ path: '.env.local' });

// MongoDB 연결 캐시 클리어
console.log('🧹 MongoDB 연결 캐시를 클리어합니다...');

// 캐시된 연결 정보 삭제
if (global.mongoose) {
  console.log('📦 기존 mongoose 캐시 발견');
  delete global.mongoose;
}

// 환경 변수 확인
console.log('🔍 환경 변수 확인:');
console.log('- MONGODB_URI 존재:', !!process.env.MONGODB_URI);
console.log('- JWT_SECRET 존재:', !!process.env.JWT_SECRET);

// MongoDB URI의 일부만 표시 (보안상)
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log('- MONGODB_URI:', maskedUri);
}

console.log('✅ 캐시 클리어 완료');
console.log('🚀 이제 개발 서버를 재시작하세요: npm run dev');















