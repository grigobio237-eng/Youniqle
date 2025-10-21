# Youniqle 모바일 앱 전환 전략 (3개 앱)

## 📱 앱 구성

```
┌─────────────────────────────────────────────────────────┐
│                    Youniqle 모바일 생태계                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣ 유저용 앱 (Youniqle)                                │
│     - 일반 고객을 위한 쇼핑 앱                            │
│     - iOS/Android 앱스토어 배포                          │
│     - 우선순위: 최우선 ⭐⭐⭐                             │
│                                                         │
│  2️⃣ 파트너용 앱 (Youniqle Partner)                      │
│     - 파트너(판매자)를 위한 관리 앱                        │
│     - 상품/주문/정산 관리                                │
│     - 우선순위: 중간 ⭐⭐                                 │
│                                                         │
│  3️⃣ 관리자용 앱 (Youniqle Admin)                        │
│     - 내부 관리자를 위한 통합 관리 앱                      │
│     - 시스템 전체 관리                                   │
│     - 우선순위: 낮음 ⭐                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 목차
1. [앱별 기능 비교](#1-앱별-기능-비교)
2. [개발 우선순위 및 전략](#2-개발-우선순위-및-전략)
3. [1️⃣ 유저용 앱 상세 가이드](#3-유저용-앱-상세-가이드)
4. [2️⃣ 파트너용 앱 상세 가이드](#4-파트너용-앱-상세-가이드)
5. [3️⃣ 관리자용 앱 상세 가이드](#5-관리자용-앱-상세-가이드)
6. [공통 API 및 백엔드](#6-공통-api-및-백엔드)
7. [전체 일정 및 비용](#7-전체-일정-및-비용)
8. [기술 스택 결정](#8-기술-스택-결정)

---

## 1. 앱별 기능 비교

### 📊 기능 매트릭스

| 기능 분류 | 유저용 앱 | 파트너용 앱 | 관리자용 앱 |
|----------|----------|-----------|-----------|
| **쇼핑 기능** |
| 상품 검색/조회 | ✅ | ✅ (자사 상품만) | ✅ (전체) |
| 장바구니 | ✅ | ❌ | ❌ |
| 주문/결제 | ✅ | ❌ | ❌ |
| 위시리스트 | ✅ | ❌ | ❌ |
| 리뷰 작성 | ✅ | ❌ | ❌ |
| Q&A | ✅ | ✅ (답변) | ✅ (답변) |
| **관리 기능** |
| 상품 등록/수정 | ❌ | ✅ | ✅ |
| 주문 관리 | ✅ (내 주문) | ✅ (파트너 주문) | ✅ (전체) |
| 재고 관리 | ❌ | ✅ | ✅ |
| 정산 관리 | ❌ | ✅ | ✅ |
| 콘텐츠 관리 | ❌ | ✅ | ✅ |
| **시스템 관리** |
| 사용자 관리 | ❌ | ❌ | ✅ |
| 파트너 승인 | ❌ | ❌ | ✅ |
| 쿠폰 생성 | ❌ | ❌ | ✅ |
| 시스템 설정 | ❌ | ❌ | ✅ |
| 분석/통계 | ❌ | ✅ (파트너) | ✅ (전체) |
| **기타** |
| 푸시 알림 | ✅ | ✅ | ✅ |
| 실시간 채팅 | ✅ | ✅ | ✅ |
| AI 챗봇 | ✅ | ❌ | ❌ |

---

## 2. 개발 우선순위 및 전략

### 🎯 권장 개발 순서

```
Phase 1 (1-2개월)
└── 1️⃣ 유저용 앱 (PWA)
    ├── 즉시 고객 확보 가능
    ├── 매출 직접 연결
    └── 앱스토어 배포 준비

Phase 2 (1-2개월)
└── 2️⃣ 파트너용 앱 (PWA)
    ├── 파트너 업무 효율 향상
    ├── 모바일로 즉시 대응 가능
    └── 웹 기반으로 충분

Phase 3 (3-4개월)
├── 1️⃣ 유저용 앱 (React Native)
│   ├── 완전한 네이티브 앱
│   ├── iOS/Android 앱스토어 배포
│   └── 고급 기능 추가
│
└── 3️⃣ 관리자용 앱 (PWA)
    ├── 내부 직원용
    ├── 웹 기반으로 충분
    └── 고급 관리 기능
```

### 💡 전략적 판단

#### 유저용 앱
- **반드시 네이티브 앱 필요** (React Native)
- **이유**: 
  - 앱스토어 노출로 신규 고객 유입
  - 푸시 알림으로 재구매 유도
  - 브랜드 신뢰도 향상
  - 완전한 모바일 쇼핑 경험

#### 파트너용 앱
- **PWA로 충분** (선택적으로 네이티브)
- **이유**:
  - 업무용 앱 (앱스토어 배포 불필요)
  - 빠른 업데이트 가능
  - 개발 비용 절감
  - 웹과 동일한 기능 제공

#### 관리자용 앱
- **PWA 권장** (태블릿 중심)
- **이유**:
  - 내부 직원용 (소수 사용자)
  - 대시보드/분석 화면은 큰 화면 필요
  - 데스크톱과 모바일 병행 사용
  - 빠른 업데이트 및 유지보수

---

## 3. 유저용 앱 상세 가이드

### 📱 앱 정보

```yaml
앱명: Youniqle
패키지명: 
  - iOS: com.sapienet.youniqle
  - Android: com.sapienet.youniqle
대상: 일반 고객 (B2C)
플랫폼: iOS, Android
배포: App Store, Google Play Store
```

### 🎯 핵심 기능

#### 1. 홈 & 쇼핑
```
홈 화면
├── 배너 (스와이프)
├── 카테고리 메뉴
├── 추천 상품 (AI 기반)
├── 신상품
├── 베스트셀러
└── 이벤트/프로모션

상품 검색
├── 검색 자동완성
├── 최근 검색어
├── 인기 검색어
└── 카테고리별 필터

상품 상세
├── 이미지 갤러리
├── 상품 정보
├── 가격/할인 정보
├── 리뷰 & 평점
├── Q&A
├── 관련 상품
└── 공유 기능
```

#### 2. 장바구니 & 주문
```
장바구니
├── 상품 목록
├── 수량 변경
├── 쿠폰 적용
├── 총 금액 계산
└── 결제하기

주문/결제
├── 배송지 선택/입력
├── 결제 수단 선택
├── 쿠폰/포인트 사용
├── 주문 확인
└── 결제 (Nicepay)

주문 내역
├── 주문 목록
├── 주문 상세
├── 배송 추적
├── 주문 취소/교환/환불
└── 재주문
```

#### 3. 마이페이지
```
프로필
├── 회원 정보 수정
├── 비밀번호 변경
├── 배송지 관리
└── 회원 탈퇴

멤버십
├── 등급 정보 (CEDAR ~ ECOSOUL)
├── 포인트 내역
├── 쿠폰함
└── 등급별 혜택

위시리스트
└── 찜한 상품 목록

고객지원
├── FAQ
├── 1:1 문의
├── 공지사항
└── AI 챗봇
```

### 🎨 화면 구조 (Bottom Navigation)

```
┌─────────────────────────────────┐
│         Status Bar              │
├─────────────────────────────────┤
│                                 │
│                                 │
│         Main Content            │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [홈]  [카테고리]  [장바구니]  [마이]  │
└─────────────────────────────────┘
```

### 📁 프로젝트 구조 (React Native)

```
youniqle-app/
├── app/
│   ├── (tabs)/                    # 탭 네비게이션
│   │   ├── index.tsx             # 홈
│   │   ├── categories.tsx        # 카테고리
│   │   ├── cart.tsx              # 장바구니
│   │   └── profile.tsx           # 마이페이지
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── products/
│   │   ├── [id].tsx              # 상품 상세
│   │   └── search.tsx            # 검색
│   ├── orders/
│   │   ├── index.tsx             # 주문 목록
│   │   ├── [id].tsx              # 주문 상세
│   │   └── checkout.tsx          # 결제
│   ├── wishlist/
│   │   └── index.tsx
│   └── _layout.tsx
├── components/
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductDetail.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   └── common/
│       ├── Header.tsx
│       ├── SearchBar.tsx
│       └── BottomNav.tsx
├── services/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── wishlist.ts
│   └── storage/
│       └── secure-storage.ts
├── store/
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── productStore.ts
├── constants/
│   └── config.ts
└── app.json
```

### 🔧 사용 API 엔드포인트

```typescript
// 인증 (7개)
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/verify-email

// 상품 (10개+)
GET    /api/products
GET    /api/products/[id]
GET    /api/products/recommend
GET    /api/products/search

// 장바구니 (4개)
GET    /api/cart
POST   /api/cart
PUT    /api/cart/update
DELETE /api/cart

// 주문 (6개+)
GET    /api/orders
POST   /api/orders
GET    /api/orders/[id]
POST   /api/orders/[id]/cancel

// 결제 (3개)
POST   /api/payment/request
POST   /api/payment/result
POST   /api/payment/cancel

// 위시리스트 (3개)
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/clear

// 리뷰 (4개+)
GET    /api/reviews
POST   /api/reviews
PUT    /api/reviews/[id]
DELETE /api/reviews/[id]

// 쿠폰 (4개)
GET    /api/coupons
POST   /api/coupons/download
GET    /api/me/coupons
POST   /api/coupon/validate

// 포인트 (3개)
GET    /api/points/history
POST   /api/points/use

// 알림 (3개)
GET    /api/notifications
POST   /api/notifications/settings
GET    /api/notifications/realtime
```

**총 API: 약 50개**

### 📊 개발 일정

| 주차 | 작업 내용 | 담당자 |
|-----|----------|--------|
| 1주 | 프로젝트 설정, 인증 화면 | RN Dev |
| 2주 | 홈 화면, 상품 목록 | RN Dev + Designer |
| 3주 | 상품 상세, 장바구니 | RN Dev |
| 4주 | 주문/결제 | RN Dev |
| 5주 | 마이페이지, 위시리스트 | RN Dev |
| 6주 | 푸시 알림, 카메라 | RN Dev |
| 7주 | 테스트 및 버그 수정 | RN Dev + QA |
| 8주 | 앱스토어 제출 및 심사 | DevOps |

**총 개발 기간**: 2개월

---

## 4. 파트너용 앱 상세 가이드

### 📱 앱 정보

```yaml
앱명: Youniqle Partner
패키지명: 
  - iOS: com.sapienet.youniqle.partner
  - Android: com.sapienet.youniqle.partner
대상: 파트너(판매자)
플랫폼: PWA (선택적 React Native)
배포: 웹 배포 (내부 링크 공유)
```

### 🎯 핵심 기능

#### 1. 대시보드
```
실시간 통계
├── 오늘의 주문 수
├── 오늘의 매출
├── 미처리 주문
├── 재고 부족 상품
└── 정산 대기 금액

최근 활동
├── 최근 주문 5건
├── 최근 문의 5건
└── 재고 알림
```

#### 2. 상품 관리
```
상품 목록
├── 내 상품 전체
├── 카테고리별 필터
├── 상태별 필터 (판매중/품절/숨김)
└── 검색

상품 등록/수정
├── 기본 정보 (이름, 가격, 재고)
├── 상품 설명
├── 이미지 업로드 (카메라/갤러리)
├── 카테고리 설정
└── 옵션 설정

재고 관리
├── 재고 현황
├── 재고 수정
├── 재고 알림 설정
└── 재고 부족 알림
```

#### 3. 주문 관리
```
주문 목록
├── 신규 주문 (알림)
├── 상태별 필터
├── 기간별 필터
└── 검색

주문 상세
├── 주문 정보
├── 고객 정보
├── 상품 정보
├── 배송 정보
└── 상태 변경 (준비중/배송중/완료)

배송 관리
├── 송장 번호 입력
├── 배송 상태 업데이트
└── 배송 추적
```

#### 4. 정산 관리
```
정산 내역
├── 월별 정산 목록
├── 정산 상세
├── CSV 다운로드
└── 정산 통계

정산 대시보드
├── 이번 달 예상 정산액
├── 총 매출
├── 수수료
└── 실 정산액
```

#### 5. 콘텐츠 관리
```
콘텐츠 목록
├── 동영상 콘텐츠
├── 블로그 콘텐츠
└── 상태별 필터

콘텐츠 등록
├── 제목/설명
├── 플랫폼 선택 (동영상/블로그)
├── URL 입력
├── 썸네일 자동 추출
└── 태그 설정
```

### 🎨 화면 구조 (Side Menu)

```
┌─────────────────────────────────┐
│  ☰  Youniqle Partner     [알림]  │
├─────────────────────────────────┤
│                                 │
│                                 │
│         Main Content            │
│                                 │
│                                 │
└─────────────────────────────────┘

Side Menu:
├── 📊 대시보드
├── 📦 상품 관리
├── 🛍️ 주문 관리
├── 💰 정산 관리
├── 📝 콘텐츠 관리
├── 📈 통계/분석
├── ⚙️ 설정
└── 🚪 로그아웃
```

### 📁 프로젝트 구조 (PWA)

```
youniqle-partner/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx           # 상품 목록
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # 상품 등록
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx   # 상품 수정
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settlements/
│   │   │   └── page.tsx
│   │   ├── content/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── partner/
│   │   │   ├── PartnerLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatCard.tsx
│   │   └── products/
│   │       └── ImageUpload.tsx
│   └── lib/
│       └── api/
│           └── partner.ts
└── public/
    └── manifest.json
```

### 🔧 사용 API 엔드포인트

```typescript
// 인증
POST   /api/partner/auth/login
GET    /api/partner/auth/verify

// 대시보드
GET    /api/partner/dashboard/stats

// 상품
GET    /api/partner/products
POST   /api/partner/products
GET    /api/partner/products/[id]
PUT    /api/partner/products/[id]
DELETE /api/partner/products/[id]

// 주문
GET    /api/partner/orders
GET    /api/partner/orders/[id]
PUT    /api/partner/orders/[id]

// 재고
GET    /api/partner/inventory
PUT    /api/partner/inventory/[id]

// 정산
GET    /api/partner/settlements
GET    /api/partner/settlements/[id]
GET    /api/partner/settlements/[id]/download

// 콘텐츠
GET    /api/partner/content
POST   /api/partner/content
PUT    /api/partner/content/[id]
DELETE /api/partner/content/[id]

// 통계
GET    /api/partner/analytics

// 알림
GET    /api/partner/notifications
```

**총 API: 약 25개**

### 📊 개발 일정

| 주차 | 작업 내용 | 담당자 |
|-----|----------|--------|
| 1주 | PWA 설정, 인증 | Frontend Dev |
| 2주 | 대시보드, 상품 목록 | Frontend Dev |
| 3주 | 상품 등록/수정 | Frontend Dev |
| 4주 | 주문 관리 | Frontend Dev |
| 5주 | 정산, 콘텐츠 관리 | Frontend Dev |
| 6주 | 테스트 및 배포 | Frontend Dev + QA |

**총 개발 기간**: 1.5개월

---

## 5. 관리자용 앱 상세 가이드

### 📱 앱 정보

```yaml
앱명: Youniqle Admin
패키지명: 
  - 웹 기반 PWA
대상: 내부 관리자
플랫폼: PWA (태블릿 최적화)
배포: 내부 배포만
```

### 🎯 핵심 기능

#### 1. 통합 대시보드
```
시스템 개요
├── 총 사용자 수
├── 총 파트너 수
├── 총 주문 수
├── 총 매출액
└── 시스템 상태

실시간 활동
├── 실시간 주문
├── 신규 회원
├── 파트너 신청 (알림)
└── 긴급 알림
```

#### 2. 사용자 관리
```
사용자 목록
├── 전체 사용자
├── 등급별 필터
├── 상태별 필터
└── 검색

사용자 상세
├── 기본 정보
├── 주문 이력
├── 포인트 내역
├── 쿠폰 내역
└── 등급 관리
```

#### 3. 파트너 관리
```
파트너 목록
├── 전체 파트너
├── 상태별 필터 (대기/승인/거부/정지)
└── 검색

파트너 신청 승인
├── 신청 정보 확인
├── 사업자등록증 확인
├── 승인/거부 처리
└── 수수료율 설정

파트너 상세
├── 파트너 정보
├── 상품 목록
├── 주문 현황
├── 정산 내역
└── 상태 변경
```

#### 4. 상품 관리
```
전체 상품 관리
├── 전체 상품 목록
├── 파트너별 필터
├── 카테고리별 필터
├── 상태별 필터
└── 상품 승인/거부
```

#### 5. 주문 관리
```
전체 주문 관리
├── 전체 주문 목록
├── 상태별 통계
├── 파트너별 주문
└── 문제 주문 알림

주문 상세
├── 주문 정보
├── 고객 정보
├── 파트너 정보
├── 결제 정보
└── 상태 강제 변경
```

#### 6. 정산 관리
```
정산 관리
├── 월별 정산 생성
├── 파트너별 정산
├── 정산 승인
├── 정산 통계
└── CSV 일괄 다운로드
```

#### 7. 쿠폰/프로모션
```
쿠폰 관리
├── 쿠폰 생성
├── 쿠폰 목록
├── 사용 통계
└── 쿠폰 비활성화

프로모션 관리
├── 프로모션 생성
├── 진행 중 프로모션
└── 프로모션 통계
```

#### 8. 고급 분석
```
통계/분석
├── 매출 분석
├── 상품 분석
├── 고객 분석
├── 파트너 성과 분석
└── 코호트 분석

A/B 테스트
├── 실험 생성
├── 진행 중 실험
└── 결과 분석
```

### 🎨 화면 구조 (Sidebar + Dashboard)

```
┌───────┬─────────────────────────────┐
│       │  Youniqle Admin      [알림]  │
│       ├─────────────────────────────┤
│ Side  │                             │
│ bar   │      Main Dashboard         │
│       │      (Cards, Charts)        │
│       │                             │
│       │                             │
└───────┴─────────────────────────────┘
```

### 📁 프로젝트 구조 (PWA - 기존 구조 활용)

```
기존 /admin 경로 활용
├── src/app/admin/
│   ├── dashboard/
│   ├── users/
│   ├── partners/
│   ├── products/
│   ├── orders/
│   ├── settlements/
│   ├── coupons/
│   ├── analytics/
│   └── settings/
```

**기존 관리자 페이지를 모바일 최적화**

### 🔧 사용 API 엔드포인트

```typescript
// 전체 시스템 API (120개+)
/api/admin/*

주요 카테고리:
├── /api/admin/dashboard/*      # 대시보드
├── /api/admin/users/*          # 사용자
├── /api/admin/partners/*       # 파트너
├── /api/admin/products/*       # 상품
├── /api/admin/orders/*         # 주문
├── /api/admin/settlements/*    # 정산
├── /api/admin/coupons/*        # 쿠폰
├── /api/admin/analytics/*      # 분석
├── /api/admin/notifications/*  # 알림
└── /api/admin/settings/*       # 설정
```

**총 API: 120개+**

### 📊 개발 일정

| 주차 | 작업 내용 | 담당자 |
|-----|----------|--------|
| 1주 | 기존 관리자 페이지 모바일 최적화 | Frontend Dev |
| 2주 | 태블릿 레이아웃 개선 | Frontend Dev + Designer |
| 3주 | PWA 설정 및 오프라인 지원 | Frontend Dev |
| 4주 | 테스트 및 배포 | Frontend Dev + QA |

**총 개발 기간**: 1개월

---

## 6. 공통 API 및 백엔드

### ✅ 기존 API 100% 재사용

모든 앱이 **동일한 백엔드** 사용:

```
┌─────────────────────────────────────┐
│      Vercel (Next.js API Routes)    │
│      https://www.grigobio.co.kr     │
├─────────────────────────────────────┤
│                                     │
│  🔌 API 엔드포인트 (185개+)          │
│                                     │
│  ├── /api/auth/*         (7개)      │
│  ├── /api/products/*     (12개)     │
│  ├── /api/cart/*         (4개)      │
│  ├── /api/orders/*       (8개)      │
│  ├── /api/partner/*      (25개)     │
│  └── /api/admin/*        (120개+)   │
│                                     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│         MongoDB Atlas               │
│         (데이터베이스)                │
└─────────────────────────────────────┘
```

### 🔧 필요한 백엔드 수정사항

#### 1. CORS 설정 업데이트
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*', // 모바일 앱 허용
        },
      ],
    },
  ];
}
```

#### 2. API 응답 최적화
```typescript
// 모바일용 경량 응답
GET /api/products?mobile=true

// 응답 예시
{
  id: string,
  name: string,
  price: number,
  images: [
    { url: string, size: 'thumbnail' }  // 모바일용 작은 이미지
  ],
  stock: number
}
```

#### 3. Rate Limiting 조정
```typescript
// 모바일 앱은 더 높은 한도
const getRateLimit = (userAgent: string) => {
  if (userAgent.includes('Youniqle-App')) {
    return 1000; // 앱: 1000 requests/hour
  }
  if (userAgent.includes('Youniqle-Partner')) {
    return 500;  // 파트너: 500 requests/hour
  }
  return 100;    // 웹: 100 requests/hour
};
```

---

## 7. 전체 일정 및 비용

### 📅 Phase 1: PWA 전환 (2-3개월)

| 앱 | 기간 | 인력 | 비용 |
|----|------|------|------|
| 1️⃣ 유저용 PWA | 2주 | FE Dev 1명 | 500만원 |
| 2️⃣ 파트너용 PWA | 1.5개월 | FE Dev 1명 | 1,500만원 |
| 3️⃣ 관리자용 PWA | 1개월 | FE Dev 1명 | 1,000만원 |

**Phase 1 총 비용**: **3,000만원**  
**Phase 1 총 기간**: **3개월** (병렬 작업 시 2개월)

---

### 📅 Phase 2: React Native 앱 (3-4개월)

| 앱 | 기간 | 인력 | 비용 |
|----|------|------|------|
| 1️⃣ 유저용 RN 앱 | 2개월 | RN Dev 2명, Designer 1명 | 5,000만원 |
| 2️⃣ 파트너용 RN 앱 (선택) | 1.5개월 | RN Dev 1명 | 2,500만원 |

**Phase 2 총 비용**: **5,000만원** (유저용만) / **7,500만원** (파트너용 포함)  
**Phase 2 총 기간**: **2-3개월**

---

### 💰 전체 비용 요약

#### 옵션 A: PWA 만 (권장 1단계)
- **총 비용**: 3,000만원
- **총 기간**: 2-3개월
- **장점**: 빠른 출시, 낮은 비용, 즉시 효과

#### 옵션 B: PWA + 유저용 RN 앱 (권장 완성)
- **총 비용**: 8,000만원
- **총 기간**: 4-5개월
- **장점**: 완전한 모바일 생태계, 앱스토어 배포

#### 옵션 C: 전체 (3개 모두 RN)
- **총 비용**: 10,500만원
- **총 기간**: 5-6개월
- **장점**: 모든 앱 네이티브, 최고 성능

---

## 8. 기술 스택 결정

### 📊 앱별 기술 스택 매트릭스

| 앱 | Phase 1 | Phase 2 | 이유 |
|----|---------|---------|------|
| **유저용** | PWA | React Native | 앱스토어 배포 필수 |
| **파트너용** | PWA | PWA (또는 RN) | 업무용, 웹으로 충분 |
| **관리자용** | PWA | PWA | 내부용, 태블릿 중심 |

### 🎯 최종 권장 전략

```
┌─────────────────────────────────────────────────────────┐
│                  권장 개발 로드맵                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Month 1-2: 유저용 PWA + 파트너용 PWA                    │
│  └─ 빠른 출시, 즉시 사용 가능                             │
│                                                         │
│  Month 3: 관리자용 PWA                                  │
│  └─ 내부 관리 효율화                                     │
│                                                         │
│  Month 4-5: 유저용 React Native 앱                      │
│  └─ 앱스토어 배포, 완전한 모바일 경험                      │
│                                                         │
│  Month 6+: 파트너용 RN 앱 (선택사항)                     │
│  └─ 파트너 요청 시 추가 개발                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. 다음 단계

### ✅ 즉시 시작 가능한 작업

#### Step 1: 유저용 PWA 구현 (지금 시작)
```bash
# PWA_IMPLEMENTATION_GUIDE.md 참고
cd youniqle
npm install next-pwa
# ... 가이드 따라 진행
```

#### Step 2: 앱별 기능 명세 작성 (1주)
- [ ] 유저용 앱 상세 화면 설계
- [ ] 파트너용 앱 상세 화면 설계
- [ ] 관리자용 앱 상세 화면 설계

#### Step 3: 디자인 시스템 구축 (2주)
- [ ] 각 앱별 디자인 가이드
- [ ] 컴포넌트 라이브러리
- [ ] 아이콘 세트

#### Step 4: 개발 착수
- [ ] 유저용 PWA (2주)
- [ ] 파트너용 PWA (1.5개월)
- [ ] 관리자용 PWA (1개월)

---

## 10. 체크리스트

### 📋 의사결정 체크리스트

- [ ] **유저용 앱**: PWA → React Native 2단계 전략 승인
- [ ] **파트너용 앱**: PWA로 시작 (RN은 선택사항)
- [ ] **관리자용 앱**: PWA로 개발
- [ ] **예산 승인**: Phase 1 (3,000만원)
- [ ] **일정 승인**: 2-3개월
- [ ] **인력 배정**: Frontend Dev 1-2명
- [ ] **디자이너 배정**: UI/UX Designer 1명

### 📋 개발 시작 체크리스트

- [ ] 개발 환경 설정
- [ ] Git 브랜치 전략 수립
- [ ] 디자인 시스템 구축
- [ ] API 문서 정리
- [ ] 테스트 계획 수립

---

**작성일**: 2025년 10월 20일  
**작성자**: AI Development Team  
**문서 버전**: 2.0.0 (3앱 분리 버전)  
**다음 업데이트**: 각 앱별 상세 구현 가이드

