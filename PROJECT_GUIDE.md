# Youniqle 쇼핑몰 프로젝트 지침서

## 📋 프로젝트 개요

**프로젝트명**: Youniqle  
**기술 스택**: Next.js 15, TypeScript, Tailwind CSS, MongoDB Atlas, Mongoose, Vercel Blob Storage  
**배포**: Vercel  
**결제**: Nicepay  
**회사**: 주식회사 사피에넷  
**파트너 시스템**: ✅ 완성 (2025.09.28)

## 🏢 회사 정보

- **상호**: 주식회사 사피에넷
- **대표**: 장범진
- **사업자등록번호**: 838-88-02527
- **통신판매업신고**: 제 2024-서울강동-1687 호
- **주소**: 서울특별시 강동구 고덕비즈밸리로 26
- **전화**: 1577-0729
- **이메일**: suchwawa@sapienet.com

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.5.4** (App Router, TypeScript)
- **React 18**
- **Tailwind CSS** (스타일링)
- **shadcn/ui** (UI 컴포넌트)
- **Framer Motion** (애니메이션)
- **Lucide React** (아이콘)

### Backend
- **Next.js API Routes**
- **MongoDB Atlas** (데이터베이스)
- **Mongoose** (ODM)
- **NextAuth.js** (인증 시스템)
- **JWT** (토큰 기반 인증)
- **bcryptjs** (비밀번호 해싱)
- **Nodemailer** (이메일 발송)
- **Vercel Blob Storage** (이미지 파일 저장)
- **Kakao Postcode API** (주소 검색)

### 개발 도구
- **TypeScript**
- **ESLint**
- **tsx** (TypeScript 실행)
- **dotenv** (환경변수)

## 📁 프로젝트 구조

```
youniqle/
├── public/
│   ├── character/           # 캐릭터 이미지들
│   │   ├── youniqle-1.png  # 대표 캐릭터 (로고용)
│   │   ├── youniqle-2.png  # 플로팅 캐릭터
│   │   ├── youniqle-3.png  # 플로팅 캐릭터
│   │   ├── youniqle-4.png  # Features 섹션용
│   │   ├── youniqle-5.png  # Features 섹션용
│   │   └── youniqle-6.png  # Features 섹션용
│   └── README.md
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API 라우트
│   │   │   ├── auth/       # 인증 API
│   │   │   ├── products/   # 상품 API
│   │   │   ├── content/    # 콘텐츠 API
│   │   │   ├── partner/    # 파트너 API (콘텐츠 관리 포함)
│   │   │   ├── admin/      # 관리자 API
│   │   │   ├── cart/       # 장바구니 API
│   │   │   ├── orders/     # 주문 API
│   │   │   └── payments/   # 결제 API
│   │   ├── products/       # 상품 페이지
│   │   ├── content/        # 콘텐츠 페이지
│   │   ├── about/          # 소개 페이지
│   │   ├── privacy/        # 개인정보 처리방침 페이지
│   │   ├── terms/          # 이용약관 페이지
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   └── page.tsx        # 홈페이지
│   ├── components/         # React 컴포넌트
│   │   ├── ui/             # UI 컴포넌트
│   │   │   ├── CharacterImage.tsx  # 캐릭터 이미지 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── products/       # 상품 관련 컴포넌트
│   │   └── auth/           # 인증 관련 컴포넌트
│   ├── lib/                # 유틸리티
│   │   ├── db.ts           # MongoDB 연결
│   │   ├── auth.ts         # 인증 유틸리티
│   │   ├── utils.ts        # 공통 유틸리티
│   │   └── validators.ts   # 검증 유틸리티
│   ├── content/            # 콘텐츠 상수
│   │   └── siteAbout.ts    # 소개 페이지 콘텐츠
│   ├── models/             # Mongoose 모델
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Content.ts      # 콘텐츠 모델
│   │   └── PartnerReferral.ts
│   ├── scripts/            # 시드 스크립트
│   │   ├── seed-products.ts
│   │   └── seed-content.ts
│   └── styles/
│       └── globals.css
├── .env.local              # 환경변수
├── .env.example            # 환경변수 예시
├── next.config.js          # Next.js 설정
├── tailwind.config.ts      # Tailwind 설정
├── tsconfig.json           # TypeScript 설정
└── package.json
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #3B82F6 (파란색)
- **Secondary**: #10B981 (초록색)
- **Accent**: #F59E0B (주황색)
- **Text Primary**: #1F2937 (진한 회색)
- **Text Secondary**: #6B7280 (연한 회색)
- **Background**: #FFFFFF (흰색)

### 폰트
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### 캐릭터 시스템
- **youniqle-1.png**: 대표 캐릭터 (로고, Hero 섹션)
- **youniqle-2.png**: 플로팅 캐릭터 (Hero, Newsletter)
- **youniqle-3.png**: 플로팅 캐릭터 (Hero, Newsletter)
- **youniqle-4.png**: Features 섹션 (프리미엄 품질)
- **youniqle-5.png**: Features 섹션 (빠른 배송)
- **youniqle-6.png**: Features 섹션 (안전한 결제)

## 📱 페이지 구조

### 1. 홈페이지 (`/`)
- **Hero 섹션**: 메인 캐릭터 + 플로팅 캐릭터들
- **상품 섹션**: 실제 상품 데이터 기반 상품 카드 표시 (최신 8개 상품)
- **상품 이미지**: Vercel Blob Storage에서 이미지 로딩
- **상품 연결**: 클릭 시 상품 상세 페이지로 이동
- **Features 섹션**: 3가지 특징 (각각 다른 캐릭터)
- **Newsletter 섹션**: 구독 유도 (배경 캐릭터들)

### 2. 상품 페이지 (`/products`)
- 상품 목록 및 필터링
- 검색 기능
- 카테고리별 분류
- 신선식품 카테고리 포함

### 3. 콘텐츠 페이지 (`/content`)
- **Hero 섹션**: 캐릭터들과 함께하는 메인 배너
- **카테고리 섹션**: 동영상, 블로그 플랫폼별 카드 (숏츠 제거됨)
- **인기 콘텐츠**: 실제 데이터베이스에서 가져온 콘텐츠 목록
- **CTA 섹션**: 구독 및 콘텐츠 보기 유도
- **콘텐츠 상세 페이지**: 동영상/블로그 개별 상세 보기

### 4. 소개 페이지 (`/about`)
- **Hero 섹션**: 브랜드 슬로건 "프리미엄을 더 공정하게"
- **가치 선언**: 5가지 핵심 가치 (선별 큐레이션, 투명 가격, 빠른 응대, 안전 결제, 멤버십 혜택)
- **상세 소개**: 3개 문단으로 구성된 브랜드 스토리
- **A/B 테스트 슬로건**: 3가지 대체 슬로건
- **파트너 섹션**: 파트너십 문의 및 상품 둘러보기
- **회사 정보**: 운영사 및 사업자 정보 (삭제됨 - 사용자 요청)

### 5. 개인정보 처리방침 페이지 (`/privacy`)
- **간단한 디자인**: 복잡한 요소 제거, 읽기 쉬운 레이아웃
- **12개 섹션**: 수집 항목, 이용 목적, 보유 기간, 제3자 제공, 처리 위탁, 국외 이전, 쿠키, 이용자 권리, 안전성 확보조치, 만 14세 미만, 고지 의무, 시행일
- **시행일**: 2025년 9월 1일

### 6. 이용약관 페이지 (`/terms`)
- **간단한 디자인**: 개인정보 처리방침과 동일한 디자인
- **15개 섹션**: 목적 및 정의, 약관 효력, 회원가입, 멤버십, 주문/결제, 환불, 제휴회원, 금지행위, 지식재산권, 서비스 변경, 면책, 분쟁해결, AI 상담, 공지 및 연락, 시행일
- **시행일**: 2025년 9월 1일

## 📝 콘텐츠 관리

### siteAbout.ts
브랜드 정체성과 관련된 모든 텍스트 콘텐츠를 중앙 집중식으로 관리하는 상수 파일입니다.

```typescript
const ABOUT_CONTENT = {
  brand: "Youniqle",
  company: "주식회사 사피에넷",
  payment: "Nicepay",
  hero: "프리미엄을 더 공정하게.",
  short: "짧은 소개 (2-3줄)",
  standard: ["표준 소개 (4-5줄)"],
  extended: ["확장 소개 (3개 문단)"],
  values: [
    { title: "선별 큐레이션", desc: "파트너 검증·품질 표준화", icon: "Sparkles" },
    // ... 5가지 핵심 가치
  ],
  partnerOneLiner: "파트너십 한 줄 설명",
  abTests: ["A/B 테스트 슬로건 3가지"]
} as const;
```

**장점**:
- **i18n 준비**: 다국어 지원을 위한 구조
- **일관성**: 모든 페이지에서 동일한 브랜드 메시지 사용
- **유지보수**: 한 곳에서 모든 브랜드 콘텐츠 관리
- **타입 안전성**: TypeScript로 콘텐츠 구조 보장

## 🗄️ 데이터베이스 모델

### User 모델
```typescript
{
  email: string;
  passwordHash?: string; // 소셜 로그인 시 선택적
  name: string;
  phone?: string;
  avatar?: string;
  role: 'member' | 'partner' | 'admin';
  grade: 'bronze' | 'silver' | 'gold';
  points: number;
  provider?: 'local' | 'google' | 'kakao' | 'naver';
  providerId?: string;
  marketingConsent: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  addresses: Address[];
  wishlist: Array<{
    productId: ObjectId;
    addedAt: Date;
  }>; // 위시리스트
  createdAt: Date;
  updatedAt: Date;
}
```

### Product 모델
```typescript
{
  name: string;
  slug: string;
  price: number;
  originalPrice?: number; // 할인 전 가격
  stock: number;
  category: string;
  summary: string;
  description: string;
  images: Image[];
  status: 'active' | 'inactive';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Content 모델
```typescript
{
  title: string;
  description: string;
  platform: 'video' | 'blog';  // 동영상, 블로그 2개 카테고리로 단순화
  type: 'link' | 'file';
  url: string;
  thumbnail?: string;
  views: number;
  likes: number;
  publishedAt?: Date;  // 선택적 필드
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  category: string;
  featured: boolean;
  // 파트너 관련 필드
  partnerId?: ObjectId;
  partnerName?: string;
  partnerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order 모델
```typescript
{
  userId: ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Review 모델
```typescript
{
  productId: ObjectId;
  userId: ObjectId;
  orderId?: ObjectId; // 구매 인증용
  rating: number; // 1-5 통합 별점
  title?: string; // 리뷰 제목
  content: string; // 리뷰 내용
  images: string[]; // 리뷰 이미지들
  isVerified: boolean; // 구매 인증 여부
  helpfulCount: number; // 도움됨 수
  helpfulUsers: ObjectId[]; // 도움됨을 누른 사용자들
  replies: Array<{
    userId: ObjectId;
    content: string;
    createdAt: Date;
  }>; // 관리자/파트너 답변
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}
```

### Question 모델
```typescript
{
  productId: ObjectId;
  userId: ObjectId;
  title: string;
  content: string;
  isPrivate: boolean;
  answers: Array<{
    userId: ObjectId;
    content: string;
    isOfficial: boolean;
    createdAt: Date;
  }>;
  status: 'pending' | 'answered' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 환경변수 설정

`.env.local` 파일에 다음 변수들을 설정해야 합니다:

```env
# 데이터베이스
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/youniqle

# 사이트 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # 로컬: http://localhost:3000, 프로덕션: https://youniqle.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth.js 설정
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000  # 로컬: http://localhost:3000, 프로덕션: https://youniqle.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Naver OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 결제 시스템
NICEPAY_MERCHANT_ID=your-nicepay-merchant-id
NICEPAY_API_KEY=your-nicepay-api-key

# 이미지 파일 저장
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_QhlswIWiISfSeRTa_k0z1OGdbKZHGOVWjXz9unBz4sO4hsd

# 이메일 설정 (Hiworks)
SMTP_HOST=smtps.hiworks.com
SMTP_PORT=465
SMTP_USER=suchwawa@sapienet.com
SMTP_PASS=your-hiworks-mail-password
EMAIL_FROM=suchwawa@sapienet.com
```

## 🚀 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm run start

# 린트 검사
npm run lint

# 상품 시드 데이터 생성
npm run seed

# 콘텐츠 시드 데이터 생성
npm run seed-content
```

## 📦 주요 기능

### ✅ 완료된 기능
1. **프로젝트 초기화** - Next.js 15 + TypeScript 설정
2. **데이터베이스 연결** - MongoDB Atlas + Mongoose
3. **인증 시스템** - NextAuth.js 기반 소셜 로그인 + 이메일 인증
4. **소셜 로그인** - Google, Kakao, Naver OAuth 연동
5. **이메일 인증** - 회원가입 시 이메일 인증 시스템
6. **UI 컴포넌트** - shadcn/ui 기반 컴포넌트 시스템
7. **상품 페이지** - 상품 목록, 필터링, 검색
8. **콘텐츠 페이지** - 미디어 콘텐츠 관리 시스템
9. **소개 페이지** - 브랜드 정체성 중심의 소개 페이지
10. **개인정보 처리방침** - 간단하고 읽기 쉬운 개인정보 보호 정책
11. **이용약관** - 서비스 이용 관련 약관 및 정책
12. **캐릭터 시스템** - 브랜드 캐릭터 활용
13. **반응형 디자인** - 모든 화면 크기 대응
14. **헤더 네비게이션** - 소개, 개인정보처리방침, 이용약관 링크 연결
15. **마이페이지** - 사용자 프로필 및 추가 정보 관리
16. **장바구니 시스템** - 상품 추가/삭제/수량 변경, 실시간 업데이트
17. **멤버십 등급 시스템** - 5단계 등급 (CEDAR, ROOTER, BLOOMER, GLOWER, ECOSOUL)
18. **주소 관리** - 카카오(다음) 우편번호 서비스 연동
19. **추천인 시스템** - 추천인 코드 및 추천인 ID 관리

### ✅ 새로 완료된 기능 (v1.5.0)
19. **주문 내역 페이지** - 사용자 주문 이력 조회 및 취소 기능
20. **위시리스트 시스템** - 상품 찜하기, 찜한 상품 관리
21. **상품 상세 페이지** - 하이브리드 방식 (쿠팡+블로그) 상품 상세 정보
22. **리뷰 & 별점 시스템** - 통합 별점, 이미지 리뷰, 도움됨 투표, 구매 인증
23. **Q&A 시스템** - 상품 문의 및 답변, 관리자/파트너 답변
24. **관련 상품 추천** - 카테고리, 가격대, 인기도 기반 추천
25. **카테고리별 특화 정보** - 신선식품(영양정보), 의류(사이즈가이드) 등
26. **상품 비교 기능** - 여러 상품 동시 비교
27. **최근 본 상품** - 로컬 스토리지 기반 최근 조회 상품
28. **소셜 공유** - 상품 정보 소셜 미디어 공유
29. **할인 가격 표시** - 원가/할인가 표시 시스템
30. **바로 구매하기** - 장바구니 없이 바로 결제
31. **배송 정보 상세** - 국내배송, 섬지역 추가비용 안내
32. **Vercel Blob 연동** - 이미지 업로드 및 관리 시스템
33. **GitHub 배포** - Vercel 자동 배포 시스템 구축

### 🚧 진행 예정 기능
1. **결제 시스템** - Nicepay 연동
2. **관리자 대시보드** - 상품/주문/사용자 관리
3. **파트너 대시보드** - 추천인 시스템
4. **SEO 최적화** - 메타데이터, 사이트맵
5. **에러 처리** - 404, 500 페이지

## 🛒 장바구니 시스템 (v1.4.0)

### 주요 기능
- **상품 추가/삭제**: 상품 페이지에서 장바구니에 추가, 장바구니에서 제거
- **수량 조절**: 1-99개 범위에서 수량 증가/감소
- **실시간 업데이트**: 수량 변경 시 즉시 반영
- **재고 관리**: 상품 재고 확인 및 품절 처리
- **가격 고정**: 장바구니에 담은 시점의 가격 유지

### API 엔드포인트
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart` - 상품 추가
- `DELETE /api/cart` - 상품 제거
- `PUT /api/cart/update` - 수량 업데이트

### 데이터 모델
```typescript
interface ICart {
  userId: ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
}

interface ICartItem {
  productId: ObjectId;
  quantity: number;
  price: number;
  addedAt: Date;
}
```

## 👑 멤버십 등급 시스템 (v1.4.0)

### 5단계 등급 체계
1. **CEDAR** (시작) - 0P 이상
2. **ROOTER** (뿌리) - 1,000P 이상
3. **BLOOMER** (꽃) - 5,000P 이상
4. **GLOWER** (빛) - 15,000P 이상
5. **ECOSOUL** (영혼) - 50,000P 이상

### 등급별 혜택
- **포인트 적립**: 구매, 리뷰, 댓글, 로그인, 이벤트 참여, 친구 추천
- **등급별 할인**: 등급에 따른 차등 혜택
- **특별 혜택**: LIFE NAVIGATOR 뱃지 (관리자 부여)

### 추천인 시스템
- **추천인 코드**: 고유한 추천인 ID 생성
- **추천인 ID**: 다른 사용자의 추천인 코드 입력
- **수수료 지급**: 추천인에게 수수료 지급

## 🏠 주소 관리 시스템 (v1.4.0)

### 카카오(다음) 우편번호 서비스
- **주소 검색**: 우편번호, 도로명주소, 지번주소 검색
- **상세주소 입력**: 사용자 직접 입력
- **주소 저장**: MongoDB에 주소 정보 저장
- **주소 수정**: 기존 주소 정보 수정 가능

### 주소 데이터 구조
```typescript
interface Address {
  zipCode: string;
  address1: string; // 도로명주소
  address2: string; // 상세주소
  phone?: string;   // 연락처 (선택사항)
}
```

## 🎯 비즈니스 규칙

1. **체크아웃 시 로그인 필수** - 비회원 주문 불가
2. **상품 카테고리** - 신선식품, 의류, 신발, 가방, 액세서리, 라이프스타일, 전자제품
3. **주문 상태 관리** - pending → confirmed → shipped → delivered
4. **결제 상태 관리** - pending → completed → failed
5. **파트너 추천 시스템** - 추천인 코드 기반 수수료 지급
6. **리뷰 작성 조건** - 구매 인증된 사용자만 리뷰 작성 가능
7. **Q&A 답변 권한** - 관리자(admin)와 파트너(partner)만 답변 가능
8. **배송 정책** - 국내배송 한정, 섬지역 추가 배송비 5,000원
9. **할인 가격 표시** - originalPrice가 있을 때만 할인가 표시
10. **이미지 저장** - Vercel Blob을 통한 클라우드 이미지 저장

## 📄 새로 추가된 페이지 상세

### 주문 내역 페이지 (`/orders`)
- **주문 이력 조회**: 사용자의 모든 주문 내역 표시
- **주문 상세 정보**: 상품명, 수량, 가격, 배송지 정보
- **주문 취소**: pending/confirmed 상태의 주문 취소 가능
- **주문 상태 표시**: pending, confirmed, shipped, delivered, cancelled
- **빈 상태 처리**: 주문 내역이 없을 때 안내 메시지

### 위시리스트 페이지 (`/wishlist`)
- **찜한 상품 목록**: 사용자가 찜한 상품들 표시
- **상품 정보**: 이미지, 이름, 가격, 재고 상태
- **장바구니 추가**: 위시리스트에서 바로 장바구니 추가
- **개별 삭제**: 특정 상품만 위시리스트에서 제거
- **전체 삭제**: 모든 위시리스트 상품 한번에 제거
- **빈 상태 처리**: 위시리스트가 비어있을 때 안내 메시지

### 상품 상세 페이지 (`/products/[id]`)
- **하이브리드 디자인**: 쿠팡(이미지 중심) + 블로그(콘텐츠 중심) 방식
- **상품 기본 정보**: 이름, 가격, 할인가, 재고, 카테고리
- **상품 이미지**: 대표 이미지 및 상세 이미지 갤러리
- **수량 선택**: 1-99개 범위에서 수량 조절
- **구매 액션**: 장바구니 추가, 바로 구매하기, 위시리스트 추가
- **배송 정보**: 무료배송 조건, 배송 기간, 섬지역 추가비용
- **안전 결제**: Nicepay 보안 결제 안내
- **카테고리별 특화 정보**: 신선식품(영양정보), 의류(사이즈가이드) 등
- **상품 설명**: 상세한 상품 설명 및 특징
- **리뷰 섹션**: 평점, 리뷰 목록, 도움됨 투표
- **리뷰 작성**: 별점, 제목, 내용, 이미지 업로드
- **Q&A 섹션**: 상품 문의 및 답변
- **관련 상품**: 카테고리, 가격대, 인기도 기반 추천
- **소셜 공유**: 상품 정보 소셜 미디어 공유
- **최근 본 상품**: 로컬 스토리지 기반 최근 조회 상품

### 소개 페이지 (`/about`)
- **브랜드 정체성**: "프리미엄을 더 공정하게" 슬로건
- **5가지 핵심 가치**:
  - 선별 큐레이션 (파트너 검증·품질 표준화)
  - 투명 가격 (합리적 마진, 숨김 없음)
  - 빠른 응대 (구매 전후 1:1 지원)
  - 안전 결제 (Nicepay 기반 보안 결제)
  - 멤버십 혜택 (등급·포인트로 더 합리하게)
- **브랜드 스토리**: 3개 문단으로 구성된 상세 소개
- **A/B 테스트 슬로건**: 3가지 대체 슬로건 제공
- **파트너십**: 파트너 문의 및 상품 둘러보기 CTA

### 개인정보 처리방침 (`/privacy`)
- **간단한 디자인**: 복잡한 요소 제거, 읽기 쉬운 레이아웃
- **12개 핵심 섹션**:
  1. 수집하는 개인정보의 항목 및 방법
  2. 개인정보의 이용 목적
  3. 보유 및 이용기간
  4. 제3자 제공
  5. 처리의 위탁 (Nicepay, Vercel, MongoDB Atlas 등)
  6. 국외 이전
  7. 쿠키·분석 도구
  8. 이용자의 권리
  9. 안전성 확보조치
  10. 만 14세 미만 아동
  11. 고지의 의무
  12. 시행일 (2025년 9월 1일)

### 이용약관 (`/terms`)
- **간단한 디자인**: 개인정보 처리방침과 동일한 디자인
- **15개 핵심 섹션**:
  1. 목적 및 정의 (회사, 회원, 제휴회원, 포인트)
  2. 약관의 효력 및 변경
  3. 회원가입 및 계정
  4. 멤버십 등급 및 포인트
  5. 주문·결제·전자쿠폰 제공
  6. 청약철회 및 환불
  7. 제휴(파트너) 회원
  8. 금지행위
  9. 지식재산권
  10. 서비스 변경·중단
  11. 면책
  12. 분쟁해결 및 준거법
  13. AI 상담 및 비의료 고지
  14. 공지 및 연락 (1577-0729)
  15. 시행일 (2025년 9월 1일)

## 🎬 콘텐츠 관리 시스템 (v2.1.0)

### 📋 콘텐츠 시스템 개요

콘텐츠 관리 시스템은 파트너가 동영상, 블로그 콘텐츠를 등록하고 관리할 수 있는 시스템입니다.

### 🔧 콘텐츠 카테고리

#### 지원 플랫폼
- **동영상**: YouTube 등 동영상 플랫폼 콘텐츠
- **블로그**: 블로그 포스트 및 기사 콘텐츠

#### 제거된 플랫폼
- **숏츠**: 시스템에서 완전 제거됨 (파일 및 기능 모두 삭제)

### 📝 파트너 콘텐츠 관리

#### 파트너 콘텐츠 페이지 (`/partner/content`)
- **콘텐츠 목록**: 파트너가 등록한 모든 콘텐츠 표시
- **콘텐츠 등록**: 새 콘텐츠 등록 모달
- **검색 및 필터링**: 제목, 플랫폼별 검색
- **상태 관리**: 초안, 게시됨, 보관됨 상태 관리
- **유튜브 썸네일 자동 추출**: URL 입력 시 자동 썸네일 생성

#### 콘텐츠 등록 프로세스
1. **기본 정보 입력**: 제목, 설명, 플랫폼 선택
2. **URL 입력**: 유튜브, 블로그 링크 입력
3. **썸네일 자동 추출**: 유튜브 URL에서 자동 썸네일 생성
4. **태그 및 카테고리**: 콘텐츠 분류 설정
5. **상태 설정**: 초안 또는 게시됨 상태 선택

### 👨‍💼 관리자 콘텐츠 관리

#### 관리자 콘텐츠 페이지 (`/admin/content`)
- **전체 콘텐츠 관리**: 모든 파트너의 콘텐츠 조회
- **콘텐츠 승인**: 콘텐츠 승인/거부 기능
- **통계 대시보드**: 플랫폼별 콘텐츠 통계
- **검색 및 필터링**: 고급 검색 옵션

### 🎯 사용자 콘텐츠 페이지

#### 메인 콘텐츠 페이지 (`/content`)
- **Hero 섹션**: 캐릭터들과 함께하는 메인 배너
- **카테고리 선택**: 동영상, 블로그 플랫폼별 카드
- **인기 콘텐츠**: 실제 데이터베이스에서 가져온 콘텐츠 목록

#### 동영상 콘텐츠 페이지 (`/content/video`)
- **동영상 목록**: 등록된 모든 동영상 콘텐츠 표시
- **썸네일 표시**: 유튜브 썸네일 자동 표시
- **플레이 버튼**: 썸네일에 플레이 아이콘 오버레이
- **상세 페이지 연결**: 클릭 시 상세 페이지로 이동

#### 블로그 콘텐츠 페이지 (`/content/blog`)
- **블로그 목록**: 등록된 모든 블로그 콘텐츠 표시
- **미리보기**: 블로그 내용 미리보기
- **외부 링크**: 원본 블로그로 이동

#### 콘텐츠 상세 페이지 (`/content/video/[id]`, `/content/blog/[id]`)
- **콘텐츠 상세 정보**: 제목, 설명, 태그 표시
- **미디어 표시**: 동영상 임베드 또는 블로그 미리보기
- **플랫폼 버튼**: 원본 플랫폼으로 이동하는 버튼
- **관련 콘텐츠**: 같은 카테고리의 다른 콘텐츠 추천

### 🔧 기술적 구현

#### API 라우트 구조
```
/api/partner/content/
├── [GET, POST] - 파트너 콘텐츠 목록/등록
└── [id]/[GET, PATCH, DELETE] - 콘텐츠 상세/수정/삭제

/api/content/
├── [GET] - 전체 콘텐츠 조회
└── [id]/[GET] - 개별 콘텐츠 조회

/api/admin/content/
├── [GET] - 관리자 콘텐츠 관리
└── [id]/[PATCH] - 콘텐츠 상태 변경
```

#### 유튜브 썸네일 추출
```typescript
function getYouTubeThumbnail(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return '';
}
```

#### Next.js 이미지 최적화
```javascript
// next.config.js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.youtube.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'qhlswiwiisfserta.public.blob.vercel-storage.com',
      port: '',
      pathname: '/**',
    },
  ],
}
```

## 🔍 문제 해결

### 자주 발생하는 문제들

1. **ChunkLoadError**
   - 해결: `.next` 폴더 삭제 후 재시작
   ```bash
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

2. **onError 핸들러 에러**
   - 해결: `CharacterImage` 클라이언트 컴포넌트 사용

3. **searchParams 에러 (Next.js 15)**
   - 해결: `await searchParams` 사용
   ```typescript
   const params = await searchParams;
   ```

4. **MongoDB 연결 실패**
   - 해결: 환경변수 확인, 네트워크 접근 설정 확인

5. **이미지 로딩 실패**
   - 해결: `next.config.js`에 도메인 추가
   ```javascript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'images.unsplash.com',
         port: '',
         pathname: '/**',
       },
     ],
   }
   ```

6. **상품 이미지 로딩 실패**
   - 해결: 상품 데이터 구조 확인 및 `sizes` prop 추가
   ```typescript
   // 상품 이미지 데이터 구조
   images: Array<{
     url: string;
     _id: string;
   }>;
   
   // 이미지 컴포넌트 사용
   <Image
     src={product.images[0].url}
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
   />
   ```

7. **상품 상세 페이지 연결 실패**
   - 해결: API에서 `_id`를 `id`로 변환
   ```typescript
   const transformedProducts = products.map((product: any) => ({
     ...product,
     id: product._id,
   }));
   ```

8. **CharacterImage sizes 경고**
   - 해결: 모든 CharacterImage에 `sizes` prop 추가
   ```typescript
   <CharacterImage
     src="/character/youniqle-1.png"
     sizes="200px"
   />
   ```

## 🌐 웹 배포 후 변경사항

### 🔧 환경변수 변경
웹 배포 후 다음 환경변수들을 프로덕션 URL로 변경해야 합니다:

```env
# 프로덕션 환경변수
NEXT_PUBLIC_SITE_URL=https://youniqle.vercel.app
NEXTAUTH_URL=https://youniqle.vercel.app
```

### 🔗 OAuth 설정 변경

#### 1. Google OAuth 설정
**Google Cloud Console** (`https://console.cloud.google.com/`)
- **승인된 JavaScript 원본**: `https://youniqle.vercel.app`
- **승인된 리디렉션 URI**: `https://youniqle.vercel.app/api/auth/callback/google`

#### 2. Kakao OAuth 설정
**Kakao Developers** (`https://developers.kakao.com/`)
- **플랫폼 설정** → **Web 플랫폼 등록**
- **사이트 도메인**: `youniqle.vercel.app`
- **Redirect URI**: `https://youniqle.vercel.app/api/auth/callback/kakao`

#### 3. Naver OAuth 설정
**Naver Developers** (`https://developers.naver.com/`)
- **서비스 URL**: `https://youniqle.vercel.app`
- **Callback URL**: `https://youniqle.vercel.app/api/auth/callback/naver`

### 📸 OAuth 검수용 캡처 화면

#### Google OAuth 검수
- **검수 불필요**: Google은 자동 승인

#### Kakao OAuth 검수
**Kakao Developers** → **제품 설정** → **카카오 로그인** → **동의항목**
- **필수 동의항목**:
  - 닉네임 ✅
  - 카카오계정(이메일) ✅
- **캡처 화면 업로드**:
  - 로그인 페이지에서 카카오 로그인 버튼이 표시되는 화면
  - 로그인 후 사용자 정보가 표시되는 화면

#### Naver OAuth 검수
**Naver Developers** → **네이버 로그인 검수상태** 탭
- **제공 정보 활용처 확인**:
  - 회원이름 ✅
  - 이메일 주소 ✅
  - 성별 ✅
  - 생일 ✅
  - 출생연도 ✅
  - 휴대전화번호 ✅
- **캡처 파일 업로드**:
  - 로그인 페이지에서 네이버 로그인 버튼이 표시되는 화면
  - 로그인 후 사용자 정보가 표시되는 화면
  - 각 제공 정보가 실제로 사용되는 화면들

### 🚀 배포 체크리스트

#### 배포 전 확인사항
- [ ] 모든 OAuth 클라이언트 ID/Secret 확인
- [ ] 환경변수 프로덕션 URL로 변경
- [ ] 이메일 발송 테스트 (Hiworks SMTP)
- [ ] 데이터베이스 연결 테스트

#### 배포 후 확인사항
- [ ] Google OAuth 리디렉션 URI 업데이트
- [ ] Kakao OAuth 도메인 및 리디렉션 URI 업데이트
- [ ] Naver OAuth 서비스 URL 및 Callback URL 업데이트
- [ ] 각 OAuth 제공자에서 검수 신청
- [ ] 소셜 로그인 기능 테스트
- [ ] 이메일 인증 기능 테스트

### 📋 OAuth 검수 신청 순서

1. **Google**: 자동 승인 (검수 불필요)
2. **Kakao**: 
   - 동의항목 설정 완료
   - 캡처 화면 업로드
   - 검수 신청
3. **Naver**:
   - 제공 정보 활용처 확인
   - 캡처 파일 업로드 (최대 5개, 5MB 이하)
   - 검수 신청

### ⚠️ 주의사항

- **개인정보 마스킹**: 캡처 화면에서 개인정보는 반드시 마스킹 처리
- **파일 형식**: PDF, JPG, GIF, PNG, 오피스 파일 지원
- **검수 기간**: 보통 1-3일 소요
- **검수 실패 시**: 피드백에 따라 수정 후 재신청

## 📞 지원

문의사항이 있으시면 다음으로 연락해주세요:
- **이메일**: suchwawa@sapienet.com
- **전화**: 1577-0729
- **운영시간**: 평일 09:00 - 18:00

## 📝 업데이트 로그

### v1.3.0 (2024-01-26)
- **소셜 로그인 시스템** - Google, Kakao, Naver OAuth 연동
- **이메일 인증 시스템** - 회원가입 시 이메일 인증 기능
- **NextAuth.js 통합** - JWT 기반 인증 시스템으로 업그레이드
- **User 모델 확장** - 소셜 로그인 및 이메일 인증 필드 추가
- **마이페이지 구현** - 사용자 프로필 및 추가 정보 관리
- **Hiworks SMTP 연동** - 이메일 발송 시스템 구축
- **웹 배포 가이드** - OAuth 검수 및 배포 후 설정 가이드 추가

### v1.2.0 (2024-01-25)
- **소개 페이지 추가** - 브랜드 정체성 중심의 소개 페이지 구현
- **개인정보 처리방침 페이지** - 간단하고 읽기 쉬운 개인정보 보호 정책
- **이용약관 페이지** - 서비스 이용 관련 약관 및 정책
- **헤더 네비게이션 업데이트** - 소개, 개인정보처리방침, 이용약관 링크 연결
- **콘텐츠 상수 분리** - `siteAbout.ts`로 브랜드 콘텐츠 관리
- **디자인 시스템 개선** - 일관성 있는 페이지 디자인 적용

### v1.6.0 (2024-12-28) - 고급 관리자 기능 완성 🎉
- **관리자 주문 관리 시스템** - 실시간 주문 현황 대시보드 및 처리
- **파트너별 주문 현황** - 파트너별 주문 현황 및 성과 분석
- **상세 통계 및 트렌드 분석** - 일별/월별 주문 트렌드, 파트너 성과 분석
- **관리자 알림 시스템** - 긴급 주문, 결제 실패, 재고 부족, 대량 주문 알림
- **재고 관리 연동 시스템** - 실시간 재고 추적, 자동 재고 알림, 주문 연동
- **고객 분석 및 세분화** - VIP/충성/일반/신규/이탈위험/비활성 고객 분류
- **자동화 규칙 시스템** - 고액 주문 자동 처리, 품절 상품 자동 비활성화
- **파트너용 재고 관리** - 파트너 전용 재고 현황 모니터링 및 관리
- **파트너용 재고 알림** - 재고 부족, 품절, 재고 조정 알림 시스템
- **주문 상태 전환 규칙** - 관리자/파트너별 상태 변경 권한 및 규칙
- **이메일 알림 시스템** - 고객/파트너/관리자 대상 이메일 알림
- **데이터베이스 모델 확장** - 재고 관리, 고객 분석, 자동화 규칙 필드 추가
- **MongoDB 완전 연동** - 모든 기능의 MongoDB 데이터베이스 연동 확인

### v1.5.0 (2024-12-28)
- **주문 내역 페이지** - 사용자 주문 이력 조회 및 취소 기능
- **위시리스트 시스템** - 상품 찜하기, 찜한 상품 관리
- **상품 상세 페이지** - 하이브리드 방식 (쿠팡+블로그) 상품 상세 정보
- **리뷰 & 별점 시스템** - 통합 별점, 이미지 리뷰, 도움됨 투표, 구매 인증
- **Q&A 시스템** - 상품 문의 및 답변, 관리자/파트너 답변
- **관련 상품 추천** - 카테고리, 가격대, 인기도 기반 추천
- **카테고리별 특화 정보** - 신선식품(영양정보), 의류(사이즈가이드) 등
- **상품 비교 기능** - 여러 상품 동시 비교
- **최근 본 상품** - 로컬 스토리지 기반 최근 조회 상품
- **소셜 공유** - 상품 정보 소셜 미디어 공유
- **할인 가격 표시** - 원가/할인가 표시 시스템
- **바로 구매하기** - 장바구니 없이 바로 결제
- **배송 정보 상세** - 국내배송, 섬지역 추가비용 안내
- **Vercel Blob 연동** - 이미지 업로드 및 관리 시스템
- **GitHub 배포** - Vercel 자동 배포 시스템 구축
- **데이터베이스 모델 확장** - Review, Question 모델 추가
- **User 모델 확장** - wishlist 필드 추가
- **Product 모델 확장** - originalPrice, featured 필드 추가

### v1.4.0 (2024-12-28)
- **장바구니 시스템 구현** - 상품 추가/삭제/수량 변경, 실시간 업데이트
- **멤버십 등급 시스템** - 5단계 등급 (CEDAR, ROOTER, BLOOMER, GLOWER, ECOSOUL)
- **주소 관리 시스템** - 카카오(다음) 우편번호 서비스 연동
- **추천인 시스템** - 추천인 코드 및 추천인 ID 관리
- **마이페이지 개선** - 멤버십 정보, 주소 관리, 프로필 업데이트
- **헤더 장바구니 연동** - 장바구니 개수 실시간 표시
- **API 최적화** - 장바구니 CRUD API, 사용자 정보 관리 API

### v1.3.0 (2024-01-26)
- **마이페이지 구현** - 사용자 프로필 및 추가 정보 관리
- **NextAuth.js 통합** - 소셜 로그인 및 세션 관리
- **사용자 모델 확장** - 주소, 마케팅 동의, 멤버십 정보

### v1.2.0 (2024-01-26)
- **소개 페이지 추가** - 브랜드 정체성 중심의 소개 페이지 구현
- **개인정보 처리방침 페이지** - 간단하고 읽기 쉬운 개인정보 보호 정책
- **이용약관 페이지** - 서비스 이용 관련 약관 및 정책
- **헤더 네비게이션 업데이트** - 소개, 개인정보처리방침, 이용약관 링크 연결
- **콘텐츠 상수 분리** - `siteAbout.ts`로 브랜드 콘텐츠 관리
- **디자인 시스템 개선** - 일관성 있는 페이지 디자인 적용

### v2.0.0 (2025-09-28) - 파트너 시스템 완성 🎉
- **파트너 시스템 구축** - 완전한 파트너 관리 시스템 구현
- **파트너 신청 시스템** - 사용자 마이페이지 통합 신청 폼
- **관리자 파트너 관리** - 승인/거부/정지 기능 및 알림 시스템
- **파트너 대시보드** - 파트너 전용 관리 페이지
- **파트너 상품 관리** - 파트너별 상품 등록/수정/삭제
- **이미지 업로드 시스템** - Vercel Blob Storage 연동
- **카카오 주소 검색** - 파트너 신청 시 주소 검색 모달
- **문서 업로드** - 사업자등록증, 통장사본 업로드 기능
- **실시간 알림** - 관리자 파트너 승인 대기 알림 배지
- **테스트 데이터** - 관리자/파트너/사용자 테스트 계정 생성
- **MongoDB 연결 최적화** - IP 화이트리스트 및 캐시 관리

### v2.1.0 (2025-01-29) - 콘텐츠 관리 시스템 및 상품 표시 최적화 🎉
- **파트너 콘텐츠 관리 시스템** - 파트너 전용 콘텐츠 등록/관리 시스템 구현
- **관리자 콘텐츠 관리** - 전체 콘텐츠 관리 및 승인 시스템
- **콘텐츠 카테고리 정리** - 동영상, 블로그 2개 카테고리로 단순화 (숏츠 제거)
- **콘텐츠 API 시스템** - CRUD API 및 썸네일 자동 추출 기능
- **유튜브 썸네일 시스템** - 유튜브 URL에서 자동 썸네일 추출
- **콘텐츠 상세 페이지** - 동영상/블로그 상세 보기 페이지
- **메인 페이지 상품 표시** - 실제 상품 데이터 기반 상품 카드 표시
- **상품 이미지 최적화** - Vercel Blob Storage 이미지 정상 로딩
- **상품 ID 시스템 수정** - API 응답에서 `_id`를 `id`로 변환하여 상품 상세 페이지 연결
- **CharacterImage 최적화** - 모든 CharacterImage 컴포넌트에 `sizes` prop 추가
- **Next.js 이미지 최적화** - `next.config.js`에 Vercel Blob 도메인 추가

### v1.1.0 (2024-01-25)
- **콘텐츠 페이지 추가** - 미디어 콘텐츠 관리 시스템
- **상품 페이지 개선** - 검색 및 필터링 기능 강화
- **캐릭터 시스템 도입** - 브랜드 캐릭터 활용

### v1.0.0 (2024-01-25)
- 프로젝트 초기 설정 완료
- 기본 페이지 구조 구축
- 데이터베이스 모델 설계
- API 라우트 구축
- 인증 시스템 구현

---

## 🏪 파트너 시스템 (v2.0.0)

### 📋 파트너 시스템 개요

파트너 시스템은 Youniqle 쇼핑몰의 핵심 기능으로, 개인/기업이 자체 상품을 등록하고 판매할 수 있는 플랫폼입니다.

### 🔐 파트너 인증 시스템

#### 파트너 신청 프로세스
1. **사용자 마이페이지** (`/me`)에서 파트너 신청
2. **신청 정보 입력**:
   - 사업자 정보 (사업자명, 사업자번호, 사업장 주소)
   - 연락처 정보 (사업장 전화번호, 은행 정보)
   - 사업자등록증 및 통장사본 업로드
3. **관리자 승인** 대기 상태 (`partnerStatus: 'pending'`)
4. **관리자 승인/거부** 후 파트너 상태 변경

#### 파트너 상태 관리
- `none`: 파트너 신청 안함
- `pending`: 승인 대기 중
- `approved`: 승인됨 (파트너 기능 사용 가능)
- `rejected`: 거부됨
- `suspended`: 정지됨

### 🎯 파트너 전용 기능

#### 파트너 대시보드 (`/partner/dashboard`)
- 파트너별 통계 (총 상품 수, 주문 수, 매출, 수수료)
- 최근 주문 현황
- 수수료 정산 정보

#### 파트너 상품 관리 (`/partner/products`)
- 상품 등록/수정/삭제
- 이미지 업로드 (Vercel Blob Storage)
- 상품 상태 관리

#### 파트너 로그인 (`/partner/login`)
- 파트너 전용 인증 시스템
- JWT 토큰 기반 인증
- 승인된 파트너만 접근 가능

### 👨‍💼 관리자 파트너 관리

#### 관리자 파트너 관리 페이지 (`/admin/partners`)
- 파트너 신청 목록 조회
- 승인/거부/정지 기능
- 파트너별 상세 정보 확인
- 수수료율 설정

#### 실시간 알림 시스템
- 승인 대기 중인 파트너 수 표시
- 사이드바 메뉴에 빨간 배지 알림
- 상단 알림 아이콘에 총 알림 수 표시
- 30초마다 자동 알림 업데이트

### 🔧 기술적 구현

#### 데이터베이스 모델 확장
```typescript
// User 모델에 파트너 관련 필드 추가
partnerStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended'
partnerApplication: {
  businessName: string
  businessNumber: string
  businessAddress: string
  businessDetailAddress: string
  businessPhone: string
  businessDescription: string
  bankAccount: string
  bankName: string
  accountHolder: string
  businessRegistrationImage: string
  bankStatementImage: string
  appliedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectedReason?: string
}
partnerSettings: {
  commissionRate: number
  autoApproval: boolean
  notificationEmail: string
  notificationPhone: string
}
partnerStats: {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  lastSettlementAt?: Date
}
```

#### API 라우트 구조
```
/api/partner/
├── auth/
│   ├── login - 파트너 로그인
│   ├── logout - 파트너 로그아웃
│   ├── verify - 파트너 토큰 검증
│   └── apply - 파트너 신청
├── dashboard/
│   └── stats - 파트너 통계
└── products/
    ├── [GET, POST] - 상품 목록/등록
    └── [id]/[GET, PATCH, DELETE] - 상품 상세/수정/삭제

/api/admin/
├── partners/
│   ├── [GET] - 파트너 목록 조회
│   └── [id]/[PATCH] - 파트너 상태 변경
└── notifications/
    └── [GET] - 알림 정보 조회
```

#### 이미지 업로드 시스템
- **Vercel Blob Storage** 연동
- **폴더 구조**: `partners/{partnerId}/products/`, `partners/{partnerId}/documents/`
- **파일 타입 제한**: 이미지 파일만 허용
- **파일 크기 제한**: 5MB 이하
- **업로드/삭제 API**: `/api/upload`, `/api/upload/delete`

### 📱 사용자 인터페이스

#### 파트너 신청 폼 (`/me`)
- **카카오 주소 검색** 모달 통합
- **상세 주소 입력** 필드
- **문서 업로드** (사업자등록증, 통장사본)
- **실시간 업로드 상태** 표시
- **안내 메시지** 동적 표시

#### 관리자 인터페이스
- **파트너 관리** 사이드바 메뉴
- **승인 대기 알림** 배지
- **파트너 상세 정보** 모달
- **일괄 승인/거부** 기능

### 🧪 테스트 시스템

#### 테스트 계정 생성
```bash
npm run create-test-data
```

#### 테스트 계정 정보
- **관리자**: `admin@youniqle.com` / `admin123!`
- **승인된 파트너**: `partner@youniqle.com` / `partner123!`
- **일반 사용자**: `user@youniqle.com` / `user123!`

#### 테스트 체크리스트
- 파트너 신청 프로세스
- 관리자 승인/거부 기능
- 파트너 상품 관리
- 이미지 업로드/삭제
- 알림 시스템 작동

### 🔒 보안 및 권한 관리

#### 파트너 권한
- 승인된 파트너만 파트너 페이지 접근 가능
- 파트너는 자신의 상품만 관리 가능
- 파트너별 수수료율 관리

#### 관리자 권한
- 파트너 승인/거부/정지 권한
- 파트너 수수료율 설정 권한
- 모든 파트너 정보 조회 권한

### 📊 성능 최적화

#### 데이터베이스 최적화
- 파트너 상태별 인덱스 설정
- 파트너 통계 캐싱
- 이미지 URL 최적화

#### 프론트엔드 최적화
- 실시간 알림 30초 간격 업데이트
- 이미지 지연 로딩
- 컴포넌트 메모이제이션

---

## 🎯 고급 관리자 기능 (v1.6.0)

### 📊 관리자 주문 관리 시스템

#### 실시간 주문 현황 대시보드
- **주문 통계**: 총 주문, 총 매출, 처리 대기, 완료된 주문
- **주문 목록**: 검색, 필터링, 상태별 정렬
- **상태 관리**: 주문 상태 실시간 업데이트
- **파트너별 주문**: 파트너별 주문 현황 및 성과 분석

#### 주문 상태 전환 규칙
```typescript
// 관리자 권한
- pending → confirmed, preparing, shipped, delivered, cancelled
- confirmed → preparing, shipped, delivered, cancelled
- preparing → shipped, delivered, cancelled
- shipped → delivered
- delivered → (변경 불가)
- cancelled → (변경 불가)

// 파트너 권한
- confirmed → preparing, shipped, delivered
- preparing → shipped, delivered
- shipped → delivered
- delivered → (변경 불가)
```

### 📦 재고 관리 연동 시스템

#### 실시간 재고 추적
- **재고 상태**: 충분, 부족, 품절, 과다
- **예약 재고**: 주문은 했지만 아직 결제 안된 재고
- **가용 재고**: 실제 판매 가능한 재고 수량
- **최소/최대 재고**: 재고 관리 기준 설정

#### 자동 재고 관리
- **주문 생성 시**: 재고 예약 (reservedStock 증가)
- **결제 완료 시**: 재고 확정 (stock 감소, reservedStock 감소)
- **주문 취소 시**: 재고 복구 (stock 증가)
- **재고 부족 시**: 자동 상품 비활성화

#### 파트너용 재고 관리
- **재고 현황 모니터링**: 파트너 전용 재고 대시보드
- **재고 조정**: 수량 증가/감소, 최소/최대 재고 설정
- **재고 알림**: 재고 부족, 품절 시 이메일 알림
- **통계 대시보드**: 재고 상태별 상품 수 표시

### 👥 고객 분석 및 세분화

#### 고객 세분화 시스템
- **VIP 고객**: 매출 상위 5% 고객
- **충성 고객**: 월 평균 2회 이상 주문
- **일반 고객**: 정기적으로 구매하는 고객
- **신규 고객**: 가입 후 30일 이내 고객
- **이탈 위험 고객**: 위험 점수 70 이상
- **비활성 고객**: 90일 이상 미구매

#### 고객 분석 데이터
- **생애 가치**: 총 구매액, 평균 주문액, 주문 빈도
- **구매 패턴**: 선호 카테고리, 월별 지출 패턴
- **이탈 위험 점수**: 0-100점 위험도 점수
- **개인화 추천**: 고객별 맞춤 추천사항

### 🤖 자동화 규칙 시스템

#### 기본 자동화 규칙
1. **고액 주문 자동 확인**: 50만원 이상 주문 자동 확인
2. **품절 상품 자동 비활성화**: 재고 0개 시 자동 비활성화
3. **신규 고객 환영 이메일**: 첫 주문 시 자동 환영 이메일
4. **긴급 주문 알림**: 2시간 이상 미처리 주문 관리자 알림
5. **가격 자동화**: 오래된 상품 자동 할인 (옵션)

#### 자동화 규칙 실행
- **실시간 실행**: 주문/상품/고객 이벤트 시 즉시 실행
- **주기적 실행**: 5분마다 배치 실행
- **조건부 실행**: 특정 조건 만족 시에만 실행
- **에러 처리**: 자동화 실패 시 로그 기록

### 📧 이메일 알림 시스템

#### 관리자 알림
- **긴급 주문**: 2시간 이상 미처리 주문
- **결제 실패**: 결제 실패 시 알림
- **재고 부족**: 최소 재고 수준 도달 시 알림
- **대량 주문**: 대량 주문 발생 시 알림
- **시스템 오류**: 시스템 오류 발생 시 알림

#### 파트너 알림
- **재고 부족**: 최소 재고 수준 도달 시 알림
- **품절 알림**: 재고 0개 시 즉시 알림
- **새 주문**: 새 주문 발생 시 알림
- **주문 취소**: 주문 취소 시 알림
- **결제 완료**: 결제 완료 시 알림
- **재고 조정**: 재고 수정 시 변경 내역 알림

#### 고객 알림
- **주문 상태 변경**: 주문 상태 변경 시 알림
- **배송 시작**: 배송 시작 시 알림
- **배송 완료**: 배송 완료 시 알림
- **주문 취소**: 주문 취소 시 환불 안내

### 🗄️ 데이터베이스 모델 확장

#### Product 모델 확장
```typescript
{
  // 재고 관리 필드
  minStock?: number;        // 최소 재고 수준
  maxStock?: number;        // 최대 재고 수준
  reservedStock?: number;   // 예약된 재고
  status: 'active' | 'hidden' | 'out_of_stock';
  
  // 파트너 알림 필드
  partnerEmail?: string;    // 파트너 이메일 (알림용)
  
  // 카테고리별 특화 정보
  nutritionInfo?: {         // 신선식품 영양정보
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
    sodium?: string;
  };
  originInfo?: {            // 원산지 및 보관방법
    origin?: string;
    storageMethod?: string;
    shelfLife?: string;
    packagingMethod?: string;
  };
  clothingInfo?: {          // 의류 정보
    sizeGuide?: string;
    material?: string;
    careInstructions?: string;
  };
  electronicsInfo?: {       // 전자제품 정보
    specifications?: string;
    includedItems?: string;
    warranty?: string;
  };
}
```

#### User 모델 확장
```typescript
{
  // 위시리스트 필드
  wishlist: Array<{
    productId: ObjectId;
    addedAt: Date;
  }>;
}
```

### 🔧 새로운 API 엔드포인트

#### 관리자 주문 관리 API
- `GET /api/admin/orders` - 전체 주문 조회
- `GET /api/admin/orders/stats` - 주문 통계
- `GET /api/admin/orders/analytics` - 주문 분석
- `PATCH /api/admin/orders/[id]/status` - 주문 상태 변경

#### 재고 관리 API
- `GET /api/admin/inventory` - 전체 재고 현황
- `GET /api/admin/inventory/[id]` - 특정 상품 재고 현황
- `PATCH /api/admin/inventory/[id]` - 재고 수량 조정

#### 파트너 재고 관리 API
- `GET /api/partner/inventory` - 파트너 재고 현황
- `GET /api/partner/inventory/[id]` - 특정 상품 재고 현황
- `PATCH /api/partner/inventory/[id]` - 재고 수량 및 설정 조정

#### 결제 확인 API
- `POST /api/orders/[id]/confirm-payment` - 결제 완료 시 재고 확정

### 📊 MongoDB 완전 연동 확인

#### 데이터베이스 모델 구조
- ✅ **User** - 사용자, 파트너, 관리자 정보
- ✅ **Product** - 상품 정보 (재고, 카테고리별 특화 정보 포함)
- ✅ **Order** - 주문 정보 (파트너별 주문 분리)
- ✅ **Cart** - 장바구니 정보
- ✅ **Review** - 리뷰 및 평점 시스템
- ✅ **Question** - Q&A 시스템

#### MongoDB 연결 및 사용
- ✅ **MongoDB Atlas 연결**: 환경변수 기반 연결
- ✅ **연결 캐싱**: 성능 최적화를 위한 연결 재사용
- ✅ **모든 API에서 `connectDB()` 호출**: 데이터베이스 연결 보장
- ✅ **관계형 쿼리**: `populate()`를 통한 참조 데이터 조회
- ✅ **인덱스 최적화**: 검색 및 조회 성능 최적화

#### 구현된 기능별 MongoDB 연동
- ✅ **상품 관리**: 상품 CRUD, 카테고리별 특화 정보, 이미지 관리, 재고 관리
- ✅ **주문 시스템**: 주문 생성, 상태 관리, 파트너별 주문 분리, 결제 연동
- ✅ **사용자 관리**: 회원가입/로그인, 파트너 신청, 위시리스트, 주소 관리
- ✅ **리뷰 & Q&A**: 리뷰 시스템, Q&A 시스템, 관리자 답변
- ✅ **재고 관리**: 실시간 재고 추적, 자동 재고 알림, 재고 조정
- ✅ **고급 기능**: 고객 분석, 자동화 규칙, 알림 시스템, 통계 대시보드

### 🎯 비즈니스 규칙 업데이트

#### 재고 관리 규칙
1. **재고 예약**: 주문 생성 시 재고 예약 (reservedStock 증가)
2. **재고 확정**: 결제 완료 시 재고 확정 (stock 감소)
3. **재고 복구**: 주문 취소 시 재고 복구 (stock 증가)
4. **자동 비활성화**: 재고 0개 시 상품 자동 비활성화
5. **재고 알림**: 최소 재고 수준 도달 시 관리자/파트너 알림

#### 주문 상태 전환 규칙
1. **관리자 권한**: 모든 상태 변경 가능 (비즈니스 로직 제한)
2. **파트너 권한**: 제한된 상태만 변경 가능
3. **배송 시작 후 취소 불가**: 배송 시작 후 주문 취소 불가
4. **배송 완료 후 변경 불가**: 배송 완료된 주문은 상태 변경 불가

#### 고객 세분화 규칙
1. **VIP 고객**: 매출 상위 5% 고객
2. **충성 고객**: 월 평균 2회 이상 주문
3. **이탈 위험**: 위험 점수 70 이상
4. **비활성 고객**: 90일 이상 미구매

### 🚀 성능 최적화

#### 데이터베이스 최적화
- **인덱스 설정**: 검색, 조회, 필터링 성능 최적화
- **연결 캐싱**: MongoDB 연결 재사용으로 성능 향상
- **집계 쿼리**: 통계 및 분석 데이터 효율적 조회
- **관계형 참조**: ObjectId를 통한 효율적인 관계 설정

#### 프론트엔드 최적화
- **실시간 업데이트**: 30초 간격 자동 새로고침
- **이미지 최적화**: Vercel Blob을 통한 이미지 최적화
- **컴포넌트 메모이제이션**: 불필요한 리렌더링 방지
- **로딩 상태**: 사용자 경험을 위한 로딩 상태 표시

---

**마지막 업데이트**: 2025년 1월 29일  
**작성자**: AI Assistant  
**프로젝트 상태**: 콘텐츠 관리 시스템 및 상품 표시 최적화 완성 (v2.1.0) 🎉
