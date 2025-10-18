const jwt = require('jsonwebtoken');

// JWT 토큰 디코딩 테스트
const token = process.argv[2];
if (!token) {
  console.log('JWT 토큰을 인수로 전달해주세요.');
  process.exit(1);
}

try {
  // 토큰 디코딩 (서명 검증 없이)
  const decoded = jwt.decode(token);
  console.log('JWT 페이로드:', JSON.stringify(decoded, null, 2));
  
  // 서명 검증
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  console.log('JWT 검증 성공:', JSON.stringify(verified, null, 2));
} catch (error) {
  console.log('JWT 검증 실패:', error.message);
}












