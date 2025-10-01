# Youniqle - 프리미엄 온라인 쇼핑몰

고품질 상품을 합리적인 가격으로 제공하는 Next.js 기반 온라인 쇼핑몰입니다.

## 🚀 주요 기능

- **사용자 인증**: 회원가입, 로그인, 로그아웃
- **상품 관리**: 상품 목록, 상세 페이지, 검색 및 필터링
- **장바구니**: 상품 추가/제거, 수량 조절
- **주문 시스템**: 결제 프로세스, 주문 내역 관리
- **관리자 패널**: 상품 CRUD, 주문 관리
- **파트너 시스템**: 추천 링크, 수수료 관리
- **반응형 디자인**: 모바일 친화적 UI/UX

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: MongoDB Atlas, Mongoose
- **Authentication**: JWT, bcryptjs
- **Payment**: Nicepay PG 연동
- **Deployment**: Vercel
- **Storage**: Vercel Blob (이미지 업로드)

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

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Payment Gateway (Nicepay)
NICEPAY_MERCHANT_ID=your-nicepay-merchant-id
NICEPAY_API_KEY=your-nicepay-api-key

# File Storage (Vercel Blob) - Optional
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Email Service - Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@grigobio.co.kr
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/          # 인증 관련 API
│   │   ├── products/      # 상품 관련 API
│   │   ├── cart/          # 장바구니 API
│   │   ├── orders/        # 주문 API
│   │   └── payments/      # 결제 API
│   ├── admin/             # 관리자 페이지
│   ├── partner/           # 파트너 페이지
│   ├── products/          # 상품 목록 페이지
│   ├── product/           # 상품 상세 페이지
│   ├── cart/              # 장바구니 페이지
│   ├── checkout/          # 결제 페이지
│   └── me/                # 마이페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── products/          # 상품 관련 컴포넌트
│   └── forms/             # 폼 컴포넌트
├── lib/                   # 유틸리티 함수
│   ├── auth.ts            # 인증 관련 함수
│   ├── db.ts              # 데이터베이스 연결
│   ├── validators.ts      # Zod 유효성 검사
│   └── utils.ts           # 공통 유틸리티
├── models/                # Mongoose 모델
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   └── PartnerReferral.ts
└── styles/                # 스타일 파일
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
  grade: 'bronze' | 'silver' | 'gold';
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

### Vercel 배포

1. Vercel 계정에 연결
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

### 환경 변수 설정 (Vercel)

프로덕션 환경에서 필요한 환경 변수들을 Vercel 대시보드에서 설정하세요.

## 🔧 개발 가이드

### 새로운 API 라우트 추가

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // API 로직
    return NextResponse.json({ data: 'example' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
```

### 새로운 컴포넌트 추가

```typescript
// src/components/example/ExampleComponent.tsx
'use client';

interface ExampleComponentProps {
  title: string;
}

export default function ExampleComponent({ title }: ExampleComponentProps) {
  return (
    <div className="p-4">
      <h2>{title}</h2>
    </div>
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

2. **이미지 업로드/삭제**
   - 파트너 상품 등록 시 이미지 업로드
   - Vercel Blob 스토리지 저장 확인
   - 이미지 삭제 기능 테스트

3. **데이터베이스 검증**
   - MongoDB에 파트너 데이터 저장 확인
   - 상품, 주문 데이터 연동 확인

자세한 검증 가이드는 [VERIFICATION_GUIDE.md](./VERIFICATION_GUIDE.md)를 참조하세요.

## 🏢 회사 정보

- **상호**: 주식회사 사피에넷
- **대표**: 장범진
- **사업자등록번호**: 838-88-02527
- **통신판매업신고**: 제 2024-서울강동-1687 호
- **주소**: 서울특별시 강동구 고덕비즈밸리로 26

