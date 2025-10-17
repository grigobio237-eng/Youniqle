# Youniqle 테스트 가이드

## 📖 목차

1. [테스트 환경 설정](#테스트-환경-설정)
2. [기능별 테스트 시나리오](#기능별-테스트-시나리오)
3. [자동화 테스트](#자동화-테스트)
4. [성능 테스트](#성능-테스트)
5. [보안 테스트](#보안-테스트)
6. [문제 해결](#문제-해결)

---

## 테스트 환경 설정

### 🚀 빠른 테스트 시작

#### 1. 개발 서버 실행
```bash
# 프로젝트 클론
git clone <repository-url>
cd youniqle

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수 설정

# 개발 서버 실행
npm run dev
```

#### 2. 테스트 계정 생성
```bash
# 테스트 계정 자동 생성
curl -X POST http://localhost:3000/api/test/create-accounts
```

또는 브라우저에서 `http://localhost:3000/test-setup` 접속하여 "테스트 계정 생성하기" 버튼 클릭

#### 3. 테스트 체크리스트 확인
브라우저에서 `http://localhost:3000/test-checklist` 접속하여 각 기능별 테스트 항목 확인

### 🔑 테스트 계정 정보

#### 관리자 계정
- **이메일**: `admin@youniqle.com`
- **비밀번호**: `admin123!`
- **권한**: 모든 관리자 기능 접근 가능

#### 파트너 계정 (승인됨)
- **이메일**: `partner@youniqle.com`
- **비밀번호**: `partner123!`
- **상태**: 승인된 파트너
- **사업자명**: 파트너샵
- **수수료율**: 12%

#### 일반 사용자 계정
- **이메일**: `user@youniqle.com`
- **비밀번호**: `user123!`
- **용도**: 파트너 신청 테스트용

---

## 기능별 테스트 시나리오

### 🔐 인증 시스템 테스트

#### 회원가입 테스트
```bash
# 1. 정상 회원가입
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "테스트 사용자",
    "phone": "010-1234-5678"
  }'

# 2. 중복 이메일 테스트
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youniqle.com",
    "password": "Test123!",
    "name": "중복 테스트"
  }'

# 3. 잘못된 이메일 형식 테스트
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Test123!",
    "name": "잘못된 이메일"
  }'
```

#### 로그인 테스트
```bash
# 1. 정상 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youniqle.com",
    "password": "admin123!"
  }'

# 2. 잘못된 비밀번호 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youniqle.com",
    "password": "wrongpassword"
  }'

# 3. 존재하지 않는 사용자 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "Test123!"
  }'
```

#### Rate Limiting 테스트
```bash
# Rate Limiting 테스트 (5회 이상 시도)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@youniqle.com",
      "password": "wrongpassword"
    }'
  echo "Attempt $i"
done
```

### 🛍️ 상품 관리 테스트

#### 상품 조회 테스트
```bash
# 1. 상품 목록 조회
curl -X GET "http://localhost:3000/api/products?page=1&limit=10"

# 2. 상품 검색 테스트
curl -X GET "http://localhost:3000/api/products?search=테스트&category=electronics"

# 3. 상품 상세 조회
curl -X GET "http://localhost:3000/api/products/[product-id]"

# 4. 잘못된 상품 ID 테스트
curl -X GET "http://localhost:3000/api/products/invalid-id"
```

#### 상품 생성 테스트 (관리자)
```bash
# 관리자 토큰 필요
ADMIN_TOKEN="your-admin-jwt-token"

# 1. 정상 상품 생성
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "테스트 상품",
    "description": "테스트 상품 설명",
    "price": 10000,
    "category": "electronics",
    "stock": 100,
    "images": ["https://example.com/image.jpg"]
  }'

# 2. 필수 필드 누락 테스트
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "테스트 상품"
  }'

# 3. 잘못된 가격 테스트
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "테스트 상품",
    "description": "테스트 상품 설명",
    "price": -1000,
    "category": "electronics",
    "stock": 100
  }'
```

### 🛒 장바구니 테스트

#### 장바구니 기능 테스트
```bash
# 사용자 토큰 필요
USER_TOKEN="your-user-jwt-token"

# 1. 장바구니에 상품 추가
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "productId": "product-id",
    "quantity": 2
  }'

# 2. 장바구니 조회
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $USER_TOKEN"

# 3. 장바구니 수량 업데이트
curl -X PUT http://localhost:3000/api/cart/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "productId": "product-id",
    "quantity": 3
  }'

# 4. 장바구니에서 상품 제거
curl -X DELETE "http://localhost:3000/api/cart?productId=product-id" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 💳 주문 시스템 테스트

#### 주문 생성 테스트
```bash
# 1. 정상 주문 생성
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "price": 10000
      }
    ],
    "totalAmount": 20000,
    "shippingAddress": {
      "street": "테스트 주소",
      "city": "서울",
      "state": "서울특별시",
      "zip": "12345",
      "country": "대한민국"
    },
    "paymentMethod": "credit_card"
  }'

# 2. 빈 장바구니로 주문 시도
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "items": [],
    "totalAmount": 0,
    "shippingAddress": {
      "street": "테스트 주소",
      "city": "서울",
      "state": "서울특별시",
      "zip": "12345",
      "country": "대한민국"
    },
    "paymentMethod": "credit_card"
  }'
```

### 🔔 알림 시스템 테스트

#### 알림 생성 테스트
```bash
# 관리자 토큰 필요
ADMIN_TOKEN="your-admin-jwt-token"

# 1. 알림 템플릿 생성
curl -X POST http://localhost:3000/api/admin/notifications/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "테스트 알림",
    "type": "email",
    "subject": "테스트 제목",
    "content": "테스트 내용",
    "variables": ["userName", "productName"]
  }'

# 2. 알림 발송 테스트
curl -X POST http://localhost:3000/api/admin/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "templateId": "template-id",
    "recipients": ["user@example.com"],
    "variables": {
      "userName": "테스트 사용자",
      "productName": "테스트 상품"
    }
  }'
```

### 📊 분석 시스템 테스트

#### 실시간 분석 테스트
```bash
# 1. 이벤트 추적 테스트
curl -X POST http://localhost:3000/api/marketing/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "eventType": "page_view",
    "page": "/products",
    "metadata": {
      "productId": "product-id",
      "category": "electronics"
    }
  }'

# 2. 분석 데이터 조회
curl -X GET "http://localhost:3000/api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 🤖 AI 추천 시스템 테스트

#### 추천 API 테스트
```bash
# 1. 개인화 추천 조회
curl -X GET "http://localhost:3000/api/recommendations/personalized?userId=user-id&limit=10" \
  -H "Authorization: Bearer $USER_TOKEN"

# 2. 상품 기반 추천
curl -X GET "http://localhost:3000/api/recommendations?productId=product-id&limit=5"

# 3. 인기 상품 추천
curl -X GET "http://localhost:3000/api/recommendations/popular?limit=10"
```

### 🧪 A/B 테스트 테스트

#### A/B 테스트 생성 및 관리
```bash
# 관리자 토큰 필요
ADMIN_TOKEN="your-admin-jwt-token"

# 1. A/B 테스트 생성
curl -X POST http://localhost:3000/api/admin/ab-tests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "테스트 상품 페이지",
    "description": "상품 페이지 레이아웃 테스트",
    "testType": "conversion",
    "variants": [
      {
        "name": "Control",
        "description": "기존 레이아웃",
        "trafficAllocation": 50
      },
      {
        "name": "Variant A",
        "description": "새로운 레이아웃",
        "trafficAllocation": 50
      }
    ],
    "targetUrl": "/products",
    "successMetric": "purchase"
  }'

# 2. A/B 테스트 이벤트 추적
curl -X POST http://localhost:3000/api/marketing/ab-testing/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "testId": "test-id",
    "userId": "user-id",
    "variant": "Variant A",
    "eventType": "conversion",
    "metadata": {
      "value": 10000
    }
  }'
```

---

## 자동화 테스트

### 🚀 Jest 테스트 실행

#### 단위 테스트
```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test -- --testPathPattern=auth

# 커버리지 포함 테스트
npm test -- --coverage
```

#### 통합 테스트
```bash
# API 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e
```

### 🔧 테스트 스크립트

#### API 테스트 스크립트
```bash
#!/bin/bash
# test-api.sh

echo "🧪 API 테스트 시작..."

# 1. 인증 테스트
echo "1. 인증 테스트"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@youniqle.com","password":"admin123!"}' \
  -w "Status: %{http_code}\n"

# 2. 상품 조회 테스트
echo "2. 상품 조회 테스트"
curl -X GET "http://localhost:3000/api/products?page=1&limit=5" \
  -w "Status: %{http_code}\n"

# 3. Rate Limiting 테스트
echo "3. Rate Limiting 테스트"
for i in {1..6}; do
  response=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@youniqle.com","password":"wrongpassword"}' \
    -w "%{http_code}")
  echo "Attempt $i: Status $response"
done

echo "✅ API 테스트 완료"
```

#### 데이터베이스 테스트 스크립트
```bash
#!/bin/bash
# test-db.sh

echo "🗄️ 데이터베이스 테스트 시작..."

# MongoDB 연결 테스트
echo "1. MongoDB 연결 테스트"
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));
"

# Redis 연결 테스트
echo "2. Redis 연결 테스트"
node -e "
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
redis.ping()
  .then(() => console.log('✅ Redis 연결 성공'))
  .catch(err => console.error('❌ Redis 연결 실패:', err));
"

echo "✅ 데이터베이스 테스트 완료"
```

---

## 성능 테스트

### ⚡ 부하 테스트

#### Apache Bench (AB) 테스트
```bash
# 1. 상품 목록 API 부하 테스트
ab -n 1000 -c 10 http://localhost:3000/api/products

# 2. 로그인 API 부하 테스트
ab -n 100 -c 5 -p login.json -T application/json http://localhost:3000/api/auth/login

# login.json 파일 내용:
# {"email":"admin@youniqle.com","password":"admin123!"}
```

#### Artillery 부하 테스트
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "상품 조회 테스트"
    weight: 70
    flow:
      - get:
          url: "/api/products"
  - name: "로그인 테스트"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@youniqle.com"
            password: "admin123!"
```

```bash
# Artillery 테스트 실행
artillery run artillery-config.yml
```

### 📊 성능 모니터링

#### 메모리 사용량 모니터링
```bash
# Node.js 프로세스 메모리 사용량 확인
ps aux | grep node

# 실시간 메모리 모니터링
top -p $(pgrep node)
```

#### 데이터베이스 성능 모니터링
```bash
# MongoDB 쿼리 성능 확인
mongo --eval "db.setProfilingLevel(2, { slowms: 100 })"

# Redis 성능 확인
redis-cli --latency
```

---

## 보안 테스트

### 🛡️ 보안 취약점 테스트

#### SQL Injection 테스트
```bash
# 1. 상품 검색 SQL Injection 테스트
curl -X GET "http://localhost:3000/api/products?search=' OR 1=1 --"

# 2. 로그인 SQL Injection 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@youniqle.com OR 1=1 --","password":"admin123!"}'
```

#### XSS 테스트
```bash
# 1. 상품 검색 XSS 테스트
curl -X GET "http://localhost:3000/api/products?search=<script>alert('XSS')</script>"

# 2. 리뷰 작성 XSS 테스트
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "productId": "product-id",
    "rating": 5,
    "comment": "<script>alert('XSS')</script>"
  }'
```

#### CSRF 테스트
```bash
# 1. CSRF 토큰 없이 요청
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"items":[],"totalAmount":0}'

# 2. 잘못된 CSRF 토큰으로 요청
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-CSRF-Token: invalid-token" \
  -d '{"items":[],"totalAmount":0}'
```

### 🔒 인증 및 권한 테스트

#### 권한 없는 접근 테스트
```bash
# 1. 일반 사용자가 관리자 API 접근
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $USER_TOKEN"

# 2. 파트너가 관리자 API 접근
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# 3. 토큰 없이 보호된 API 접근
curl -X GET http://localhost:3000/api/admin/users
```

#### JWT 토큰 조작 테스트
```bash
# 1. 만료된 토큰 사용
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer expired-token"

# 2. 잘못된 서명의 토큰 사용
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid-token"
```

---

## 문제 해결

### 🐛 일반적인 문제

#### 서버 시작 실패
```bash
# 1. 포트 충돌 확인
lsof -i :3000

# 2. 환경 변수 확인
cat .env.local

# 3. 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 데이터베이스 연결 실패
```bash
# 1. MongoDB 연결 확인
mongo "mongodb+srv://username:password@cluster.mongodb.net/youniqle"

# 2. Redis 연결 확인
redis-cli ping

# 3. 환경 변수 확인
echo $MONGODB_URI
echo $REDIS_URL
```

#### 빌드 실패
```bash
# 1. TypeScript 오류 확인
npm run build 2>&1 | grep -i error

# 2. 의존성 확인
npm audit

# 3. 캐시 정리
npm run clean
```

### 📝 로그 확인

#### 애플리케이션 로그
```bash
# 1. 개발 서버 로그
npm run dev 2>&1 | tee app.log

# 2. 프로덕션 로그
pm2 logs youniqle

# 3. 에러 로그만 확인
grep -i error app.log
```

#### 데이터베이스 로그
```bash
# 1. MongoDB 로그
mongo --eval "db.adminCommand('getLog', 'global')"

# 2. Redis 로그
redis-cli monitor
```

### 🔧 디버깅 도구

#### Node.js 디버깅
```bash
# 1. Chrome DevTools로 디버깅
node --inspect-brk=9229 server.js

# 2. VS Code 디버깅
# .vscode/launch.json 설정 후 F5 키

# 3. 메모리 누수 확인
node --inspect --max-old-space-size=4096 server.js
```

#### 네트워크 디버깅
```bash
# 1. 네트워크 요청 모니터링
curl -v http://localhost:3000/api/products

# 2. SSL 인증서 확인
openssl s_client -connect grigobio.co.kr:443

# 3. DNS 확인
nslookup grigobio.co.kr
```

---

## 📊 테스트 결과 보고서

### ✅ 테스트 체크리스트

#### 기능 테스트
- [ ] 사용자 인증 (회원가입, 로그인, 로그아웃)
- [ ] 상품 관리 (조회, 생성, 수정, 삭제)
- [ ] 장바구니 기능 (추가, 수정, 삭제)
- [ ] 주문 시스템 (생성, 조회, 취소)
- [ ] 결제 시스템 (결제, 환불)
- [ ] 알림 시스템 (이메일, 푸시, SMS)
- [ ] 분석 시스템 (실시간, 퍼널, 코호트)
- [ ] AI 추천 시스템
- [ ] A/B 테스트 시스템
- [ ] 마케팅 자동화

#### 성능 테스트
- [ ] 응답 시간 (< 200ms)
- [ ] 동시 사용자 (100+ users)
- [ ] 메모리 사용량 (< 512MB)
- [ ] 데이터베이스 쿼리 성능
- [ ] 캐시 효율성

#### 보안 테스트
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] CSRF 방어
- [ ] Rate Limiting
- [ ] 인증 및 권한 관리
- [ ] 데이터 암호화

### 📈 성능 지표

#### API 성능
- **평균 응답 시간**: < 200ms
- **95% 응답 시간**: < 500ms
- **에러율**: < 1%
- **가용성**: > 99.9%

#### 데이터베이스 성능
- **쿼리 응답 시간**: < 100ms
- **연결 풀 사용률**: < 80%
- **인덱스 히트율**: > 95%

#### 캐시 성능
- **캐시 히트율**: > 90%
- **캐시 응답 시간**: < 10ms
- **메모리 사용률**: < 80%

---

## 🚀 지속적 통합/배포 (CI/CD)

### GitHub Actions 워크플로우

#### 테스트 자동화
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run security audit
      run: npm audit --audit-level moderate
```

#### 배포 자동화
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 📚 추가 자료

### 🔗 관련 문서
- [사용자 메뉴얼](./USER_MANUAL.md)
- [개발자 가이드](./DEVELOPER_GUIDE.md)
- [API 문서](./API_DOCUMENTATION.md)

### 🛠️ 도구 및 리소스
- [Jest 공식 문서](https://jestjs.io/)
- [Artillery 부하 테스트](https://artillery.io/)
- [OWASP 보안 테스트 가이드](https://owasp.org/)

### 📞 지원 및 문의
- **이메일**: suchwawa@sapienet.com
- **전화**: 1577-0729
- **GitHub Issues**: 프로젝트 저장소의 Issues 탭

---

*이 테스트 가이드는 Youniqle 플랫폼의 모든 기능을 철저히 테스트하여 안정성과 품질을 보장합니다. 정기적으로 테스트를 실행하고 결과를 검토하여 지속적인 개선을 이루어가세요.*











