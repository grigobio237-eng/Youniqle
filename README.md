# Youniqle - AI 기반 프리미엄 온라인 쇼핑몰

고품질 상품을 합리적인 가격으로 제공하는 Next.js 기반 AI 통합 온라인 쇼핑몰입니다.

## 🚀 주요 기능

### 🛍️ 핵심 쇼핑 기능
- **사용자 인증**: 회원가입, 로그인, 로그아웃, 소셜 로그인
- **상품 관리**: 상품 목록, 상세 페이지, 검색 및 필터링, 상품 비교
- **장바구니**: 상품 추가/제거, 수량 조절, 위시리스트
- **주문 시스템**: 결제 프로세스, 주문 내역 관리, 주문 추적
- **리뷰 시스템**: 상품 리뷰, 평점, Q&A
- **반응형 디자인**: 모바일 친화적 UI/UX

### 🤖 AI 및 추천 시스템
- **AI 추천 엔진**: 개인화된 상품 추천, 협업 필터링, 콘텐츠 기반 필터링
- **하이브리드 추천**: 외부 AI 서비스 + 내부 알고리즘 결합
- **개인화 엔진**: 사용자 행동 기반 맞춤형 경험
- **A/B 테스트**: 고급 다변량 테스트, 통계적 분석
- **예측 분석**: 고객 이탈 예측, 구매 예측, 수요 예측

### 📊 고급 분석 및 마케팅
- **실시간 분석**: 실시간 이벤트 추적, 대시보드
- **퍼널 분석**: 다단계 전환율 분석, 자동 인사이트
- **코호트 분석**: 고객 그룹별 행동 분석
- **LTV 분석**: 고객 생애 가치 분석 및 예측
- **고객 세분화**: RFM 분석, 행동 기반 세그먼트
- **마케팅 자동화**: 이벤트 기반 캠페인, 리타겟팅

### 🔔 알림 및 커뮤니케이션
- **실시간 알림**: WebSocket 기반 실시간 알림
- **다채널 알림**: 이메일, 푸시, SMS, 인앱 알림
- **알림 템플릿**: 다국어 지원, 동적 콘텐츠
- **알림 스케줄링**: 일회성, 반복, 이벤트 기반 스케줄
- **뉴스레터**: 구독 관리, 자동 발송
- **쿠폰 시스템**: 할인 쿠폰, 프로모션 관리

### 🛡️ 보안 및 성능
- **API 보안**: Rate Limiting, 입력 검증, CORS 보안
- **캐싱 시스템**: Redis 기반 고성능 캐싱
- **성능 모니터링**: 실시간 성능 추적, 알림
- **이미지 최적화**: WebP/AVIF 변환, 자동 리사이징
- **데이터베이스 최적화**: 인덱스 관리, 쿼리 최적화

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks, Context API
- **Charts**: Recharts, Chart.js
- **UI Components**: Radix UI, Lucide React

### Backend & Database
- **Database**: MongoDB Atlas, Mongoose ODM
- **Caching**: Redis (ioredis)
- **Authentication**: NextAuth.js, JWT, bcryptjs
- **File Storage**: Vercel Blob, Sharp (이미지 처리)

### AI & Analytics
- **AI Services**: OpenAI GPT API, Google Cloud AI
- **Machine Learning**: TensorFlow.js, scikit-learn (Python)
- **Analytics**: Custom real-time analytics engine
- **A/B Testing**: Advanced statistical analysis

### Infrastructure & Security
- **Deployment**: Vercel
- **CDN**: Vercel Edge Network
- **Security**: Rate Limiting, Input Validation, CORS
- **Monitoring**: Custom performance monitoring
- **Email**: Hiworks SMTP, Nodemailer

### External Services
- **Payment**: Nicepay PG 연동
- **Social Login**: Google, Kakao, Naver OAuth
- **Push Notifications**: Web Push API
- **Real-time**: Socket.IO

## 📦 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd youniqle
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/youniqle

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://grigobio.co.kr
NEXTAUTH_URL=https://grigobio.co.kr
NEXTAUTH_SECRET=your-nextauth-secret-here

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# Payment Gateway (Nicepay)
NICEPAY_MERCHANT_ID=your-nicepay-merchant-id
NICEPAY_API_KEY=your-nicepay-api-key

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Email Service (Hiworks)
SMTP_HOST=smtp.hiworks.com
SMTP_PORT=587
SMTP_USER=your-hiworks-email
SMTP_PASS=your-hiworks-password
EMAIL_FROM=noreply@grigobio.co.kr

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# AI Services
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-vapid-email

# Security
RATE_LIMIT_REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://grigobio.co.kr
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                           # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── auth/                 # 인증 관련 API
│   │   ├── admin/                # 관리자 API
│   │   │   ├── analytics/        # 분석 API
│   │   │   ├── automation/       # 자동화 API
│   │   │   ├── notifications/    # 알림 API
│   │   │   ├── security/         # 보안 API
│   │   │   └── segments/         # 세그먼트 API
│   │   ├── marketing/            # 마케팅 API
│   │   │   ├── ab-testing/       # A/B 테스트 API
│   │   │   ├── automation/       # 마케팅 자동화 API
│   │   │   ├── recommendations/  # 추천 API
│   │   │   └── retargeting/      # 리타겟팅 API
│   │   ├── products/             # 상품 관련 API
│   │   ├── orders/               # 주문 API
│   │   ├── notifications/        # 알림 API
│   │   └── personalization/      # 개인화 API
│   ├── admin/                    # 관리자 페이지
│   │   ├── analytics/            # 분석 대시보드
│   │   ├── automation/           # 자동화 관리
│   │   ├── notifications/        # 알림 관리
│   │   ├── security/             # 보안 대시보드
│   │   └── segments/             # 고객 세분화
│   ├── partner/                  # 파트너 페이지
│   ├── products/                 # 상품 페이지
│   ├── content/                  # 콘텐츠 페이지
│   └── me/                       # 마이페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   ├── admin/                    # 관리자 컴포넌트
│   ├── analytics/                # 분석 컴포넌트
│   ├── notifications/            # 알림 컴포넌트
│   ├── recommendations/          # 추천 컴포넌트
│   └── marketing/                # 마케팅 컴포넌트
├── lib/                          # 유틸리티 함수
│   ├── auth.ts                   # 인증 관련 함수
│   ├── db.ts                     # 데이터베이스 연결
│   ├── validators.ts             # 입력 검증
│   ├── rateLimiter.ts            # Rate Limiting
│   ├── security.ts               # 보안 미들웨어
│   ├── cache.ts                  # Redis 캐싱
│   ├── performanceMonitor.ts     # 성능 모니터링
│   ├── imageOptimizer.ts         # 이미지 최적화
│   └── dbOptimizer.ts            # DB 최적화
├── models/                       # Mongoose 모델
│   ├── User.ts                   # 사용자 모델
│   ├── Product.ts                # 상품 모델
│   ├── Order.ts                  # 주문 모델
│   ├── Notification.ts           # 알림 모델
│   ├── ABTest.ts                 # A/B 테스트 모델
│   ├── CustomerSegment.ts        # 고객 세그먼트 모델
│   ├── AnalyticsEvent.ts         # 분석 이벤트 모델
│   └── AutomationRule.ts         # 자동화 규칙 모델
├── hooks/                        # 커스텀 훅
│   ├── useRealtimeNotifications.ts
│   ├── useRecommendations.ts
│   └── usePersonalization.ts
└── styles/                       # 스타일 파일
    └── globals.css
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #008ED8 (vivid sky blue)
- **Secondary**: #F59E0B (warm amber)
- **Background**: #F9FAFB (light gray)
- **Text Primary**: #111827 (near black)
- **Text Secondary**: #6B7280 (cool gray)
- **Accent**: #10B981 (emerald green)
- **Danger**: #EF4444 (red)

### 타이포그래피
- **Primary Font**: Pretendard, Inter (sans-serif)
- **Headings**: bold, xl–3xl
- **Body**: normal, base–lg
- **Line Height**: 1.5

## 🔐 인증 시스템

JWT 기반 인증 시스템을 사용합니다:

- **회원가입**: `/api/auth/signup`
- **로그인**: `/api/auth/login`
- **로그아웃**: `/api/auth/logout`
- **사용자 정보**: `/api/auth/me`

## 📊 데이터 모델

### User (사용자)
```typescript
{
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: 'member' | 'partner' | 'admin';
  grade: 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul';
  points: number;
  addresses: Address[];
}
```

### Product (상품)
```typescript
{
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'hidden';
  images: Image[];
  summary: string;
  description: string;
}
```

### Order (주문)
```typescript
{
  userId: ObjectId;
  items: OrderItem[];
  total: number;
  addressSnapshot: Address;
  status: 'paid' | 'processing' | 'shipped' | 'completed' | 'canceled';
  payment: PaymentInfo;
  partnerId?: ObjectId;
}
```

## 🚀 배포

### ✅ 배포 완료 (2025.10.01)

- **프로덕션 URL**: https://www.grigobio.co.kr
- **Vercel 기본 URL**: https://youniqle.vercel.app
- **배포 상태**: 운영 중
- **도메인 연동**: 완료

### Vercel 배포 절차

1. ✅ Vercel 계정에 GitHub 저장소 연결
2. ✅ 도메인 구입 및 DNS 설정
3. ✅ 환경 변수 설정 (19개 변수)
4. ✅ 자동 배포 및 프로덕션 배포 완료

### 환경 변수 설정 (Vercel)

**Vercel Dashboard → Settings → Environment Variables**에서 다음 변수들을 설정합니다:

#### 핵심 환경변수
- `MONGODB_URI` - MongoDB Atlas 연결 문자열
- `NEXT_PUBLIC_SITE_URL` - https://www.grigobio.co.kr
- `NEXTAUTH_URL` - https://www.grigobio.co.kr
- `JWT_SECRET` - 강력한 랜덤 문자열 (64바이트)
- `NEXTAUTH_SECRET` - NextAuth 전용 시크릿

#### OAuth 설정
- Google OAuth (✅ 설정 완료)
- Kakao OAuth (⏳ 추후 연동)
- Naver OAuth (⏳ 추후 연동)

#### 기타 서비스
- Nicepay 결제 시스템
- Vercel Blob Storage
- Hiworks 이메일 서비스

상세한 배포 가이드는 [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)의 "Vercel 배포 가이드" 섹션을 참조하세요.

## 📚 문서 및 가이드

### 📖 사용자 가이드
- **[사용자 메뉴얼](./USER_MANUAL.md)**: 관리자, 파트너, 일반 사용자를 위한 상세 사용법
- **[API 문서](./API_DOCUMENTATION.md)**: 모든 API 엔드포인트 상세 문서
- **[테스트 가이드](./TESTING_GUIDE.md)**: 기능별 테스트 방법 및 시나리오

### 🛠️ 개발자 가이드
- **[개발자 가이드](./DEVELOPER_GUIDE.md)**: 개발 환경 설정, 코딩 컨벤션, 아키텍처
- **[프로젝트 가이드](./PROJECT_GUIDE.md)**: 프로젝트 구조 및 개발 워크플로우

### 🔧 빠른 개발 시작

#### 새로운 API 라우트 추가
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware } from '@/lib/rateLimiter';
import { createSecurityMiddleware } from '@/lib/security';
import { InputValidator, commonSchemas } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitCheck = await createRateLimitMiddleware('global')(request);
    if (rateLimitCheck) return rateLimitCheck;

    // 보안 검증
    const securityCheck = createSecurityMiddleware()(request);
    if (securityCheck) return securityCheck;

    // API 로직
    return NextResponse.json({ 
      success: true,
      data: { message: 'example' }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Server error' 
        }
      },
      { status: 500 }
    );
  }
}
```

#### 새로운 컴포넌트 추가
```typescript
// src/components/example/ExampleComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ExampleComponentProps {
  title: string;
  data?: any[];
}

export default function ExampleComponent({ title, data = [] }: ExampleComponentProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 실행
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <div>
            {data.map((item, index) => (
              <div key={index}>{item.name}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문의사항이 있으시면 다음으로 연락해주세요:
- 이메일: suchwawa@sapienet.com
- 전화: 1577-0729

## 🧪 테스트 및 검증

### 빠른 테스트 시작

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **테스트 계정 생성**
   - 브라우저에서 `http://localhost:3000/test-setup` 접속
   - "테스트 계정 생성하기" 버튼 클릭
   - 관리자, 파트너, 일반 사용자 계정 자동 생성

3. **검증 체크리스트**
   - `http://localhost:3000/test-checklist` 접속
   - 각 기능별 테스트 항목 확인
   - 완료된 항목에 체크

### 테스트 계정 정보

#### 👑 관리자 계정
- **이메일**: admin@youniqle.com
- **비밀번호**: admin123!
- **권한**: 모든 관리자 기능 접근 가능

#### 🏪 파트너 계정 (승인됨)
- **이메일**: partner@youniqle.com
- **비밀번호**: partner123!
- **상태**: 승인된 파트너 (모든 파트너 기능 사용 가능)
- **사업자명**: 파트너샵
- **수수료율**: 12%

#### 👤 일반 사용자 계정
- **이메일**: user@youniqle.com
- **비밀번호**: user123!
- **용도**: 파트너 신청 테스트용

### 주요 테스트 시나리오

1. **파트너 신청 플로우**
   - 일반 사용자로 로그인 → 마이페이지에서 파트너 신청
   - 관리자로 로그인 → 파트너 관리에서 승인
   - 파트너로 로그인 → 대시보드 및 상품 관리

2. **AI 추천 시스템**
   - 상품 조회 시 개인화 추천 확인
   - A/B 테스트 기능 테스트
   - 추천 피드백 시스템 테스트

3. **실시간 알림 시스템**
   - WebSocket 연결 테스트
   - 이메일, 푸시 알림 발송 테스트
   - 알림 설정 변경 테스트

4. **고급 분석 기능**
   - 실시간 대시보드 데이터 확인
   - 퍼널 분석, 코호트 분석 테스트
   - LTV 분석 및 예측 기능 테스트

5. **보안 및 성능**
   - Rate Limiting 테스트
   - 입력 검증 및 XSS 방어 테스트
   - 캐시 시스템 및 성능 모니터링 테스트

6. **파트너 정산 시스템** ⭐ NEW
   - 관리자: 자동 정산 생성 테스트
   - 파트너: 정산 내역 조회 및 CSV 다운로드
   - 정산 상태 변경 플로우 테스트

7. **환불/교환 시스템** ⭐ NEW
   - 사용자: 환불 신청 API 테스트
   - 관리자: 환불 승인/거부 테스트
   - 상태 추적 시스템 테스트

자세한 테스트 가이드는 [TESTING_GUIDE.md](./TESTING_GUIDE.md)를 참조하세요.

## 🏢 회사 정보

- **상호**: 주식회사 사피에넷
- **대표**: 장범진
- **사업자등록번호**: 838-88-02527
- **통신판매업신고**: 제 2024-서울강동-1687 호
- **주소**: 서울특별시 강동구 고덕비즈밸리로 26

