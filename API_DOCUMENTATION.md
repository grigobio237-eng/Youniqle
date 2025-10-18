# Youniqle API 문서

## 📖 목차

1. [API 개요](#api-개요)
2. [인증](#인증)
3. [사용자 API](#사용자-api)
4. [상품 API](#상품-api)
5. [주문 API](#주문-api)
6. [알림 API](#알림-api)
7. [분석 API](#분석-api)
8. [마케팅 API](#마케팅-api)
9. [관리자 API](#관리자-api)
10. [에러 코드](#에러-코드)

---

## API 개요

### 🌐 기본 정보

- **Base URL**: `https://www.grigobio.co.kr/api`
- **API 버전**: v1
- **인증 방식**: JWT Bearer Token
- **응답 형식**: JSON
- **문자 인코딩**: UTF-8

### 📊 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456",
    "version": "1.0"
  }
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {
      // 상세 에러 정보
    }
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456",
    "version": "1.0"
  }
}
```

### 🔐 인증

#### JWT 토큰 발급
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "사용자 이름",
      "role": "user"
    }
  }
}
```

#### 토큰 사용
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 사용자 API

### 👤 사용자 관리

#### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "사용자 이름",
  "phone": "010-1234-5678"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "사용자 이름",
      "role": "user",
      "grade": "cedar",
      "points": 0
    }
  }
}
```

#### 사용자 정보 조회
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### 사용자 정보 수정
```http
PUT /api/auth/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운 이름",
  "phone": "010-9876-5432"
}
```

#### 비밀번호 변경
```http
PUT /api/auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldPassword123!",
  "newPassword": "newPassword123!"
}
```

### 🔑 소셜 로그인

#### Google 로그인
```http
GET /api/auth/social/google
```

#### Kakao 로그인
```http
GET /api/auth/social/kakao
```

#### Naver 로그인
```http
GET /api/auth/social/naver
```

---

## 상품 API

### 🛍️ 상품 조회

#### 상품 목록 조회
```http
GET /api/products?page=1&limit=10&search=키워드&category=electronics&minPrice=10000&maxPrice=100000&sortBy=price&sortOrder=asc
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10, 최대: 100)
- `search`: 검색 키워드
- `category`: 카테고리 필터
- `minPrice`: 최소 가격
- `maxPrice`: 최대 가격
- `sortBy`: 정렬 기준 (name, price, createdAt, rating)
- `sortOrder`: 정렬 순서 (asc, desc)

**응답:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_id",
        "name": "상품명",
        "description": "상품 설명",
        "price": 50000,
        "category": "electronics",
        "images": ["image1.jpg", "image2.jpg"],
        "rating": 4.5,
        "reviewCount": 123,
        "stock": 100,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### 상품 상세 조회
```http
GET /api/products/{productId}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "product_id",
      "name": "상품명",
      "description": "상품 설명",
      "price": 50000,
      "category": "electronics",
      "images": ["image1.jpg", "image2.jpg"],
      "rating": 4.5,
      "reviewCount": 123,
      "stock": 100,
      "specifications": {
        "brand": "브랜드명",
        "model": "모델명",
        "color": "색상"
      },
      "reviews": [
        {
          "id": "review_id",
          "userName": "리뷰어명",
          "rating": 5,
          "comment": "리뷰 내용",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "questions": [
        {
          "id": "question_id",
          "userName": "질문자명",
          "question": "질문 내용",
          "answer": "답변 내용",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
}
```

### 🔍 상품 검색 및 필터링

#### 고급 검색
```http
GET /api/products/search?q=검색어&filters={"category":"electronics","brand":"삼성"}&sort=price&order=asc
```

#### 인기 상품 조회
```http
GET /api/products/popular?limit=10&period=week
```

#### 최신 상품 조회
```http
GET /api/products/recent?limit=10
```

#### 관련 상품 조회
```http
GET /api/products/{productId}/related?limit=5
```

### 🤖 AI 추천

#### 개인화 추천
```http
GET /api/recommendations/personalized?userId={userId}&limit=10
Authorization: Bearer {token}
```

#### 상품 기반 추천
```http
GET /api/recommendations?productId={productId}&limit=5
```

#### 인기 상품 추천
```http
GET /api/recommendations/popular?limit=10
```

#### 추천 피드백
```http
POST /api/recommendations/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "action": "view", // view, click, purchase, dismiss
  "metadata": {
    "source": "homepage",
    "position": 1
  }
}
```

---

## 주문 API

### 🛒 장바구니 관리

#### 장바구니 조회
```http
GET /api/cart
Authorization: Bearer {token}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "product_id",
        "name": "상품명",
        "price": 50000,
        "quantity": 2,
        "image": "image.jpg",
        "total": 100000
      }
    ],
    "totalAmount": 100000,
    "itemCount": 2
  }
}
```

#### 장바구니에 상품 추가
```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

#### 장바구니 수량 수정
```http
PUT /api/cart/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 3
}
```

#### 장바구니에서 상품 제거
```http
DELETE /api/cart?productId={productId}
Authorization: Bearer {token}
```

#### 장바구니 비우기
```http
DELETE /api/cart/clear
Authorization: Bearer {token}
```

### 💳 주문 관리

#### 주문 생성
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 50000
    }
  ],
  "totalAmount": 100000,
  "shippingAddress": {
    "name": "받는 사람",
    "street": "주소",
    "city": "도시",
    "state": "시/도",
    "zip": "우편번호",
    "country": "국가",
    "phone": "연락처"
  },
  "paymentMethod": "credit_card",
  "couponCode": "DISCOUNT10"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "status": "pending",
      "totalAmount": 100000,
      "items": [...],
      "shippingAddress": {...},
      "paymentInfo": {
        "method": "credit_card",
        "status": "pending"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### 주문 목록 조회
```http
GET /api/orders?page=1&limit=10&status=pending
Authorization: Bearer {token}
```

#### 주문 상세 조회
```http
GET /api/orders/{orderId}
Authorization: Bearer {token}
```

#### 주문 취소
```http
POST /api/orders/{orderId}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "취소 사유"
}
```

### 💰 결제 API

#### 결제 요청
```http
POST /api/payment/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_id",
  "amount": 100000,
  "paymentMethod": "credit_card",
  "cardInfo": {
    "number": "1234567890123456",
    "expiry": "12/25",
    "cvv": "123"
  }
}
```

#### 결제 결과 확인
```http
GET /api/payment/result/{paymentId}
Authorization: Bearer {token}
```

#### 결제 취소
```http
POST /api/payment/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentId": "payment_id",
  "reason": "취소 사유"
}
```

---

## 알림 API

### 🔔 알림 관리

#### 알림 목록 조회
```http
GET /api/notifications?page=1&limit=10&type=email&read=false
Authorization: Bearer {token}
```

**쿼리 파라미터:**
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `type`: 알림 타입 (email, push, sms, in_app)
- `read`: 읽음 상태 (true, false)

#### 알림 읽음 처리
```http
PUT /api/notifications/{notificationId}/read
Authorization: Bearer {token}
```

#### 알림 삭제
```http
DELETE /api/notifications/{notificationId}
Authorization: Bearer {token}
```

#### 알림 설정 조회
```http
GET /api/notifications/settings
Authorization: Bearer {token}
```

#### 알림 설정 수정
```http
PUT /api/notifications/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": {
    "orderUpdates": true,
    "promotions": false,
    "newsletter": true
  },
  "push": {
    "orderUpdates": true,
    "promotions": true,
    "newsletter": false
  },
  "sms": {
    "orderUpdates": true,
    "promotions": false,
    "newsletter": false
  }
}
```

### 📧 실시간 알림

#### WebSocket 연결
```javascript
const socket = io('https://www.grigobio.co.kr', {
  auth: {
    token: 'your-jwt-token'
  }
});

// 알림 수신
socket.on('notification', (notification) => {
  console.log('새 알림:', notification);
});

// 연결 상태 확인
socket.on('connect', () => {
  console.log('WebSocket 연결됨');
});

socket.on('disconnect', () => {
  console.log('WebSocket 연결 끊어짐');
});
```

---

## 분석 API

### 📊 실시간 분석

#### 이벤트 추적
```http
POST /api/marketing/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventType": "page_view",
  "page": "/products",
  "metadata": {
    "productId": "product_id",
    "category": "electronics",
    "source": "search"
  }
}
```

#### 실시간 대시보드 데이터
```http
GET /api/admin/analytics/realtime?period=hour
Authorization: Bearer {admin_token}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "activeUsers": 150,
    "pageViews": 1250,
    "orders": 25,
    "revenue": 2500000,
    "topPages": [
      {
        "page": "/products",
        "views": 500
      }
    ],
    "topProducts": [
      {
        "productId": "product_id",
        "name": "상품명",
        "views": 100
      }
    ]
  }
}
```

### 📈 퍼널 분석

#### 퍼널 생성
```http
POST /api/admin/analytics/funnels
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "구매 퍼널",
  "description": "방문부터 구매까지의 전환 과정",
  "steps": [
    {
      "name": "방문",
      "eventType": "page_view",
      "page": "/"
    },
    {
      "name": "상품 조회",
      "eventType": "product_view",
      "page": "/products"
    },
    {
      "name": "장바구니 추가",
      "eventType": "add_to_cart",
      "page": "/cart"
    },
    {
      "name": "결제",
      "eventType": "purchase",
      "page": "/checkout"
    }
  ]
}
```

#### 퍼널 분석 결과
```http
GET /api/admin/analytics/funnels/{funnelId}/analyze?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {admin_token}
```

### 👥 코호트 분석

#### 코호트 생성
```http
POST /api/admin/analytics/cohorts
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "월별 가입자 코호트",
  "description": "월별 가입자별 행동 분석",
  "cohortType": "registration",
  "period": "monthly",
  "metrics": ["retention", "revenue", "orders"]
}
```

#### 코호트 분석 결과
```http
GET /api/admin/analytics/cohorts/{cohortId}/analyze?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {admin_token}
```

### 💰 LTV 분석

#### 개별 고객 LTV
```http
GET /api/admin/analytics/ltv/customer/{userId}
Authorization: Bearer {admin_token}
```

#### 세그먼트별 LTV
```http
GET /api/admin/analytics/ltv/segment/{segmentId}/analyze?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {admin_token}
```

---

## 마케팅 API

### 🧪 A/B 테스트

#### A/B 테스트 생성
```http
POST /api/admin/ab-tests
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "상품 페이지 레이아웃 테스트",
  "description": "기존 레이아웃 vs 새로운 레이아웃",
  "testType": "conversion",
  "targetUrl": "/products",
  "successMetric": "purchase",
  "variants": [
    {
      "name": "Control",
      "description": "기존 레이아웃",
      "trafficAllocation": 50,
      "config": {
        "layout": "original"
      }
    },
    {
      "name": "Variant A",
      "description": "새로운 레이아웃",
      "trafficAllocation": 50,
      "config": {
        "layout": "new"
      }
    }
  ],
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

#### A/B 테스트 이벤트 추적
```http
POST /api/marketing/ab-testing/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "testId": "test_id",
  "userId": "user_id",
  "variant": "Variant A",
  "eventType": "conversion",
  "metadata": {
    "value": 100000,
    "productId": "product_id"
  }
}
```

#### A/B 테스트 결과 조회
```http
GET /api/admin/ab-tests/{testId}/analyze
Authorization: Bearer {admin_token}
```

### 🎯 고객 세분화

#### 세그먼트 생성
```http
POST /api/admin/segments
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "고가치 고객",
  "description": "RFM 분석 기반 고가치 고객",
  "type": "rfm",
  "criteria": {
    "recency": {
      "operator": "less_than",
      "value": 30,
      "unit": "days"
    },
    "frequency": {
      "operator": "greater_than",
      "value": 5
    },
    "monetary": {
      "operator": "greater_than",
      "value": 1000000
    }
  },
  "isActive": true
}
```

#### 세그먼트 멤버 조회
```http
GET /api/admin/segments/{segmentId}/members?page=1&limit=10
Authorization: Bearer {admin_token}
```

### 🤖 마케팅 자동화

#### 자동화 규칙 생성
```http
POST /api/admin/automation/rules
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "장바구니 포기 이메일",
  "description": "장바구니에 상품을 추가했지만 구매하지 않은 고객에게 이메일 발송",
  "triggerEvent": "cart_abandoned",
  "conditions": {
    "timeSinceLastActivity": {
      "operator": "greater_than",
      "value": 1,
      "unit": "hours"
    }
  },
  "actions": [
    {
      "type": "send_email",
      "templateId": "cart_abandoned_template",
      "delay": {
        "value": 1,
        "unit": "hours"
      }
    }
  ],
  "isActive": true
}
```

#### 자동화 규칙 실행
```http
POST /api/admin/automation/rules/{ruleId}/execute
Authorization: Bearer {admin_token}
```

---

## 관리자 API

### 👑 사용자 관리

#### 사용자 목록 조회
```http
GET /api/admin/users?page=1&limit=10&role=user&search=검색어
Authorization: Bearer {admin_token}
```

#### 사용자 상세 조회
```http
GET /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

#### 사용자 정보 수정
```http
PUT /api/admin/users/{userId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "새로운 이름",
  "role": "partner",
  "isActive": true
}
```

#### 사용자 삭제
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

### 🏪 파트너 관리

#### 파트너 신청 목록
```http
GET /api/admin/partners?status=pending
Authorization: Bearer {admin_token}
```

#### 파트너 신청 승인
```http
PUT /api/admin/partners/{partnerId}/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "commissionRate": 12,
  "notes": "승인 사유"
}
```

#### 파트너 신청 거부
```http
PUT /api/admin/partners/{partnerId}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "거부 사유"
}
```

### 📦 상품 관리

#### 상품 생성
```http
POST /api/admin/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "상품명",
  "description": "상품 설명",
  "price": 50000,
  "category": "electronics",
  "stock": 100,
  "images": ["image1.jpg", "image2.jpg"],
  "specifications": {
    "brand": "브랜드명",
    "model": "모델명",
    "color": "색상"
  }
}
```

#### 상품 수정
```http
PUT /api/admin/products/{productId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "수정된 상품명",
  "price": 45000,
  "stock": 150
}
```

#### 상품 삭제
```http
DELETE /api/admin/products/{productId}
Authorization: Bearer {admin_token}
```

### 📊 대시보드 통계

#### 전체 통계
```http
GET /api/admin/dashboard/stats?period=month&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {admin_token}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "new": 50,
      "active": 800
    },
    "orders": {
      "total": 500,
      "pending": 10,
      "completed": 480,
      "cancelled": 10
    },
    "revenue": {
      "total": 50000000,
      "thisMonth": 5000000,
      "growth": 15.5
    },
    "products": {
      "total": 200,
      "active": 180,
      "outOfStock": 5
    }
  }
}
```

### 🛡️ 보안 관리

#### 보안 대시보드
```http
GET /api/admin/security/dashboard
Authorization: Bearer {admin_token}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "systemHealth": {
      "status": "healthy",
      "issues": []
    },
    "securityLogs": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "type": "security_violation",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "type": "invalid_auth",
          "email": "test@example.com"
        }
      }
    ],
    "performanceMetrics": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "type": "api_request",
        "name": "GET /api/products",
        "duration": 150,
        "status": "success"
      }
    ],
    "resourceUsage": {
      "memoryUsagePercentage": 65.5,
      "cpuUsage": 45.2
    }
  }
}
```

---

## 에러 코드

### 📋 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 리소스 충돌 |
| 422 | Unprocessable Entity | 유효성 검사 실패 |
| 429 | Too Many Requests | 요청 한도 초과 |
| 500 | Internal Server Error | 서버 오류 |

### 🔍 에러 코드 목록

#### 인증 관련 (AUTH_*)
- `AUTH_INVALID_CREDENTIALS`: 잘못된 인증 정보
- `AUTH_TOKEN_EXPIRED`: 토큰 만료
- `AUTH_TOKEN_INVALID`: 잘못된 토큰
- `AUTH_INSUFFICIENT_PERMISSIONS`: 권한 부족
- `AUTH_ACCOUNT_LOCKED`: 계정 잠김
- `AUTH_EMAIL_NOT_VERIFIED`: 이메일 미인증

#### 유효성 검사 (VALIDATION_*)
- `VALIDATION_ERROR`: 유효성 검사 실패
- `VALIDATION_REQUIRED_FIELD`: 필수 필드 누락
- `VALIDATION_INVALID_FORMAT`: 잘못된 형식
- `VALIDATION_DUPLICATE_VALUE`: 중복 값
- `VALIDATION_OUT_OF_RANGE`: 범위 초과

#### 비즈니스 로직 (BUSINESS_*)
- `BUSINESS_INSUFFICIENT_STOCK`: 재고 부족
- `BUSINESS_ORDER_NOT_FOUND`: 주문 없음
- `BUSINESS_PAYMENT_FAILED`: 결제 실패
- `BUSINESS_COUPON_EXPIRED`: 쿠폰 만료
- `BUSINESS_LIMIT_EXCEEDED`: 한도 초과

#### 시스템 (SYSTEM_*)
- `SYSTEM_DATABASE_ERROR`: 데이터베이스 오류
- `SYSTEM_CACHE_ERROR`: 캐시 오류
- `SYSTEM_EXTERNAL_SERVICE_ERROR`: 외부 서비스 오류
- `SYSTEM_RATE_LIMIT_EXCEEDED`: 요청 한도 초과
- `SYSTEM_MAINTENANCE`: 시스템 점검 중

### 📝 에러 처리 예시

```javascript
// 클라이언트에서 에러 처리
try {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  const data = await response.json();

  if (!response.ok) {
    switch (data.error.code) {
      case 'VALIDATION_ERROR':
        console.error('유효성 검사 실패:', data.error.details);
        break;
      case 'AUTH_INSUFFICIENT_PERMISSIONS':
        console.error('권한이 없습니다.');
        break;
      case 'BUSINESS_INSUFFICIENT_STOCK':
        console.error('재고가 부족합니다.');
        break;
      default:
        console.error('알 수 없는 오류:', data.error.message);
    }
    return;
  }

  console.log('성공:', data.data);
} catch (error) {
  console.error('네트워크 오류:', error);
}
```

---

## 📚 추가 자료

### 🔗 관련 문서
- [사용자 메뉴얼](./USER_MANUAL.md)
- [개발자 가이드](./DEVELOPER_GUIDE.md)
- [테스트 가이드](./TESTING_GUIDE.md)

### 🛠️ 개발 도구
- [Postman Collection](./postman-collection.json)
- [OpenAPI Specification](./openapi.yaml)
- [API 테스트 스크립트](./test-scripts/)

### 📞 지원 및 문의
- **이메일**: suchwawa@sapienet.com
- **전화**: 1577-0729
- **API 지원**: api-support@grigobio.co.kr

---

*이 API 문서는 Youniqle 플랫폼의 모든 API 엔드포인트를 상세히 설명합니다. API가 업데이트될 때마다 이 문서도 함께 업데이트됩니다.*













