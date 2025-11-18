# Youniqle Commerce Platform

Next.js 기반으로 구축된 B2C 쇼핑몰 + 파트너/관리자 포털입니다. 주문‧결제 흐름과 파트너 운영 도구는 동작하지만, 고객지원(환불 UI, FAQ, 1:1 문의)과 마케팅 시스템은 아직 작업 중입니다. 이 README는 2025-11-08 기준 실제 구현 상태와 맞도록 정리했습니다.

---

## 1. 현재 기능 요약

### 고객 웹 (사용자)
- 상품 목록/검색/상세, 장바구니, 체크아웃, Nicepay 결제 (EUC-KR 인코딩, Shinhan SOLPay PC 안내)
- 주문 내역 조회 (환불/배송 버튼은 미노출), 위시리스트, 마이페이지 기본 정보/파트너 신청
- 주소 검색: Google Geocoding (파트너 신청/체크아웃)
- **미구현**: 환불 신청 UI, FAQ, 고객센터, 쿠폰·포인트 사용자 UI, 다국어 전면 적용

### 관리자 포털
- 주문/포인트/정산 대시보드, 주문 다운로드(CSV/JSON), 포인트 통계 시각화, 공지/쿠폰 관리
- 상품 승인/거부, 파트너 관리, 정산 내역, 콘솔형 로그(추후 log level 조정 필요)
- **미구현**: FAQ/문의/환불 사용자 UI에 대응하는 관리자 워크플로우 보완, 알림 자동화

### 파트너 포털
- 주문 목록/상세, 송장 입력 → `shipped` 상태 전환, 주문 다운로드(CSV/JSON)
- 상품 등록/수정(승인 대기), 정산/분석 요약, 문의 폼
- **보완 필요**: 분석/콘텐츠 오류 처리, 다국어/모바일 최적화

### 백엔드 / 공통
- Next.js App Router API + MongoDB(Mongoose) + NextAuth (email + JWT 기반)
- Nicepay 결제 플로우 (요청/승인/취소 + 서명 검증 + NetCancel), 주문/포인트/정산 API
- `connectDB()` 캐싱, 일부 API rate limit, CSV 내보내기 (UTF-8 BOM)
- **남은 작업**: 고객지원 도메인 API/모델(FAQ, Inquiry), 쿠폰/포인트 UI 연동, 알림 통합

---

## 2. 설치 및 실행

```bash
git clone <repo>
cd youniqle
npm install
```

`.env.local` 파일에 환경 변수를 설정합니다. 실제 값은 별도 공유 문서를 참고하세요.

```env
MONGODB_URI=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
JWT_SECRET=...

# OAuth (사용 중인 항목만 설정)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# KAKAO / NAVER 는 승인 후 적용 예정

# Nicepay
NICEPAY_MERCHANT_ID=...
NICEPAY_MERCHANT_KEY=...
NICEPAY_RETURN_URL=http://localhost:3000/api/payment/result
NICEPAY_CANCEL_RETURN_URL=http://localhost:3000/api/payment/cancel

# 이메일 (선택)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=...

# Vercel Blob (이미지 업로드 사용 시)
BLOB_READ_WRITE_TOKEN=...
```

개발 서버를 실행합니다.

```bash
npm run dev
# http://localhost:3000
```

---

## 3. 폴더 구조 요약

```
src/
├─ app/
│  ├─ api/               # App Router API Routes
│  │  ├─ admin/          # 주문, 포인트, 정산, 파트너 등 관리자 API
│  │  ├─ partner/        # 파트너 주문/상품/정산 API
│  │  ├─ payment/        # Nicepay(request/result/cancel)
│  │  └─ ...
│  ├─ admin/             # 관리자 UI 페이지
│  ├─ partner/           # 파트너 UI 페이지
│  ├─ checkout/          # 결제 플로우
│  ├─ orders/            # 주문 목록 (환불 UI 준비 필요)
│  └─ me/                # 마이페이지 (파트너 신청 포함)
├─ components/           # shadcn 기반 공통 컴포넌트
├─ lib/                  # DB 연결, 인증, 유틸, order status rules 등
├─ models/               # Mongoose 스키마 (Product, Order, Refund, Settlement ...)
└─ scripts/              # 데이터 이관/점검 스크립트
```

---

## 4. 최근 변경 사항 (2025-11 기준)
- Nicepay EUC-KR 인코딩 + 서명 검증 + NetCancel 대응
- `/admin/orders`·`/partner/orders` 주문 다운로드 다이얼로그 & `/api/*/orders/export`
- `/admin/points` 통계 대시보드 + `/api/admin/points/analytics` 신규
- 파트너 주문 상세/송장 다이얼로그 + `/api/partner/orders/[id]/tracking`
- Google 주소 검색(`GoogleAddressSearch`)으로 파트너 신청 폼 통일
- 문서 재정비: `ADMIN_SETTINGS_GUIDE.md`, `API_DOCUMENTATION.md`, `NEXT_STEPS_AND_PRIORITIES.md` 등 최신화

---

## 5. 남은 TODO (요약)
1. **고객지원 (최우선)**: 환불 신청 UI, FAQ, `/support` 1:1 문의 흐름, 관리자 답변 연계
2. **쿠폰/포인트 사용자 경험**: `/me/coupons`, `/me/points`, 체크아웃 UI 연동
3. **배송 추적 고도화**: 고객용 추적 페이지, 이메일/SMS 알림, 택배사 API 검토
4. **마케팅/알림**: 이메일·푸시·SMS 캠페인, 템플릿 관리, 라우트 자동 검증 스크립트
5. **다국어 & 모바일 QA**: 관리자/파트너/마이페이지 번역 적용, 모바일 레이아웃 점검

구체적인 일정과 세부 항목은 `NEXT_STEPS_AND_PRIORITIES.md` 및 각 영역별 문서를 참고하세요.

---

## 6. 테스트 메모
- 자동화 테스트는 제한적이며, 주문/결제/정산 플로우는 수동 QA 필요
- Nicepay 시뮬레이터/실 계정 테스트 전 리턴 URL, 결과 서명 검증 확인
- 파트너/관리자 주요 플로우: 송장 저장 → 상태 전환 → 정산 반영까지 확인

---

## 7. 문의
- 레거시 문서 및 민감 정보가 있는 파일은 정리 또는 삭제되었습니다. 추가 정보가 필요하면 최신 문서(`DEPLOYMENT_QUICK_GUIDE.md`, `DATABASE_MIGRATION_GUIDE.md`, `API_DOCUMENTATION.md`)를 확인하거나 담당자에게 문의하세요.

---

MIT License © Youniqle Project

