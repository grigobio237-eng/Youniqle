# Youniqle 쇼핑몰 프로젝트 지침서

## 📋 프로젝트 개요

**프로젝트명**: Youniqle  
**기술 스택**: Next.js 15, TypeScript, Tailwind CSS, MongoDB Atlas, Mongoose  
**배포**: Vercel  
**결제**: Nicepay  
**회사**: 주식회사 사피에넷

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
- **인기 상품**: 상품 미리보기
- **Features 섹션**: 3가지 특징 (각각 다른 캐릭터)
- **Newsletter 섹션**: 구독 유도 (배경 캐릭터들)

### 2. 상품 페이지 (`/products`)
- 상품 목록 및 필터링
- 검색 기능
- 카테고리별 분류
- 신선식품 카테고리 포함

### 3. 콘텐츠 페이지 (`/content`)
- **Hero 섹션**: 캐릭터들과 함께하는 메인 배너
- **카테고리 섹션**: 유튜브, 틱톡, 블로그 플랫폼별 카드
- **인기 콘텐츠**: 실제 데이터베이스에서 가져온 콘텐츠 목록
- **CTA 섹션**: 구독 및 콘텐츠 보기 유도

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
  platform: 'youtube' | 'tiktok' | 'blog' | 'instagram' | 'facebook';
  url: string;
  thumbnail?: string;
  views: number;
  likes: number;
  publishedAt: Date;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  category: string;
  featured: boolean;
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
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

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

### 🚧 진행 예정 기능
2. **주문 시스템** - 체크아웃, 주문 관리
3. **결제 시스템** - Nicepay 연동
4. **관리자 대시보드** - 상품/주문/사용자 관리
5. **파트너 대시보드** - 추천인 시스템
6. **이미지 업로드** - Vercel Blob 연동
7. **SEO 최적화** - 메타데이터, 사이트맵
8. **에러 처리** - 404, 500 페이지

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

## 📄 새로 추가된 페이지 상세

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

**마지막 업데이트**: 2024년 12월 28일  
**작성자**: AI Assistant  
**프로젝트 상태**: 개발 중 (v1.4.0)
