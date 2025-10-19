# 🎯 상품 승인 시스템 구현 완료

## 📋 구현 개요

파트너(member)가 상품을 등록하면 관리자의 승인 후에만 웹에 게시되도록 시스템을 구축했습니다.

---

## ✅ 구현된 기능

### 1️⃣ **상품 승인 워크플로우**

```
파트너 상품 등록
      ↓
  승인 대기 (pending)
      ↓
  관리자 검토
      ↓
   ┌────┴────┐
승인(approved) 거부(rejected)
      ↓          ↓
  웹 게시    파트너에게 사유 전달
```

### 2️⃣ **권한 관리**

| 역할 | 상품 등록 | 상품 수정 | 상품 삭제 | 승인/거부 | 웹 게시 |
|------|----------|----------|----------|----------|---------|
| **파트너** | ✅ | ✅ (자신 상품만) | ✅ (자신 상품만) | ❌ | ❌ |
| **관리자** | ✅ | ✅ (모든 상품) | ✅ (모든 상품) | ✅ | ✅ |
| **일반 사용자** | ❌ | ❌ | ❌ | ❌ | 👀 (승인된 상품만 조회) |

---

## 🔧 주요 수정 사항

### 1. Product 모델 업데이트 (`src/models/Product.ts`)

```typescript
// 새로 추가된 필드
approvalStatus: 'pending' | 'approved' | 'rejected'  // 승인 상태
rejectionReason?: string                              // 거부 사유
```

**인덱스 추가:**
- `approvalStatus` 필드 인덱스 추가로 조회 성능 향상
- `partnerId` 인덱스 추가로 파트너별 상품 조회 최적화

---

### 2. 파트너 API 수정

#### ✨ 토큰 이름 통일
**문제:** `partner-token` ↔ `partner_token` 불일치
**해결:** 모든 API에서 `partner-token`으로 통일

#### ✨ 상품 등록 시 승인 대기 상태
**파일:** `src/app/api/partner/products/route.ts`
```typescript
// 파트너가 등록하면 자동으로 pending 상태
approvalStatus: 'pending'
```

#### ✨ 상품 수정 시 재승인 필요
**파일:** `src/app/api/partner/products/[id]/route.ts`
```typescript
// 상품 수정 시 다시 승인 대기 상태로 변경
product.approvalStatus = 'pending';
product.rejectionReason = undefined;
```

---

### 3. 관리자 API 수정

#### ✨ 카테고리별 특화 정보 지원 추가
**파일:** `src/app/api/admin/products/route.ts`
```typescript
// POST 요청 시 카테고리별 특화 정보 포함
nutritionInfo, originInfo, clothingInfo, electronicsInfo
```

#### ✨ 관리자 등록 시 자동 승인
```typescript
// 관리자가 직접 등록하면 자동 승인
approvalStatus: 'approved'
```

#### ✨ 승인/거부 API 생성
**신규 파일:** `src/app/api/admin/products/[id]/approval/route.ts`

**승인 예시:**
```bash
POST /api/admin/products/{id}/approval
{
  "action": "approve"
}
```

**거부 예시:**
```bash
POST /api/admin/products/{id}/approval
{
  "action": "reject",
  "rejectionReason": "상품 이미지가 부적절합니다."
}
```

---

### 4. 일반 사용자용 API 수정

#### ✨ 승인된 상품만 조회
**파일:** `src/app/api/products/route.ts`
```typescript
const filter: any = { 
  status: 'active',
  approvalStatus: 'approved'  // 승인된 상품만
};
```

**파일:** `src/app/api/products/[id]/route.ts`
```typescript
const product = await Product.findOne({
  status: 'active',
  approvalStatus: 'approved'  // 승인된 상품만
});
```

---

### 5. 카테고리 목록 통일

#### ✨ 전역 상수 생성
**신규 파일:** `src/constants/categories.ts`

```typescript
export const PRODUCT_CATEGORIES = [
  { value: 'fresh-food', label: '신선식품', labelEn: 'Fresh Food' },
  { value: 'clothing', label: '의류', labelEn: 'Clothing' },
  { value: 'shoes', label: '신발', labelEn: 'Shoes' },
  { value: 'bags', label: '가방', labelEn: 'Bags' },
  { value: 'accessories', label: '액세서리', labelEn: 'Accessories' },
  { value: 'lifestyle', label: '라이프스타일', labelEn: 'Lifestyle' },
  { value: 'electronics', label: '전자제품', labelEn: 'Electronics' },
  { value: 'beauty', label: '뷰티', labelEn: 'Beauty' },
  { value: 'sports', label: '스포츠', labelEn: 'Sports' },
  { value: 'books', label: '도서', labelEn: 'Books' },
];
```

**적용된 파일:**
- `src/app/partner/products/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`

---

### 6. 파트너 페이지 UI 업데이트

**파일:** `src/app/partner/products/page.tsx`

#### ✨ 승인 상태 배지 표시
- 🟡 **승인 대기** (pending) - 노란색
- 🟢 **승인됨** (approved) - 초록색
- 🔴 **거부됨** (rejected) - 빨간색

#### ✨ 거부 사유 표시
```tsx
{product.approvalStatus === 'rejected' && product.rejectionReason && (
  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
    <strong>거부 사유:</strong> {product.rejectionReason}
  </div>
)}
```

---

### 7. 관리자 승인 관리 페이지 생성

**신규 파일:** `src/app/admin/products/approval/page.tsx`

#### ✨ 주요 기능
1. **상태별 필터링**
   - 전체 / 승인 대기 / 승인됨 / 거부됨

2. **상품 검토**
   - 상품 정보 상세 표시
   - 파트너 정보 표시
   - 이미지 미리보기

3. **승인/거부 액션**
   - ✅ 승인 버튼 - 즉시 웹 게시
   - ❌ 거부 버튼 - 거부 사유 입력 필수
   - 👁️ 미리보기 - 새 탭에서 상품 페이지 확인

4. **거부 다이얼로그**
   - 거부 사유 입력 (필수)
   - 파트너에게 전달됨

---

## 📂 수정된 파일 목록

### 모델
- ✅ `src/models/Product.ts` - approvalStatus, rejectionReason 필드 추가

### 상수
- ✅ `src/constants/categories.ts` - 카테고리 전역 상수 생성 (신규)

### API (파트너)
- ✅ `src/app/api/partner/products/route.ts` - pending 상태, 토큰 통일
- ✅ `src/app/api/partner/products/[id]/route.ts` - 토큰 통일, 권한 수정

### API (관리자)
- ✅ `src/app/api/admin/products/route.ts` - 카테고리별 특화 정보 추가
- ✅ `src/app/api/admin/products/[id]/approval/route.ts` - 승인/거부 API (신규)

### API (일반 사용자)
- ✅ `src/app/api/products/route.ts` - approved만 조회
- ✅ `src/app/api/products/[id]/route.ts` - approved만 조회

### 페이지 (파트너)
- ✅ `src/app/partner/products/page.tsx` - 승인 상태 표시, 카테고리 통일

### 페이지 (관리자)
- ✅ `src/app/admin/products/page.tsx` - 카테고리 통일
- ✅ `src/app/admin/products/new/page.tsx` - 카테고리 통일
- ✅ `src/app/admin/products/[id]/edit/page.tsx` - 카테고리 통일
- ✅ `src/app/admin/products/approval/page.tsx` - 승인 관리 페이지 (신규)

---

## 🚀 사용 방법

### 파트너 (상품 등록자)

1. `/partner/products` 페이지에서 "상품 등록" 클릭
2. 상품 정보 입력 및 이미지 업로드
3. 등록 시 **승인 대기** 상태로 저장됨
4. 상품 목록에서 승인 상태 확인
   - 🟡 승인 대기 - 관리자 검토 중
   - 🟢 승인됨 - 웹에 게시됨
   - 🔴 거부됨 - 거부 사유 확인 후 수정

### 관리자 (상품 승인자)

1. `/admin/products/approval` 페이지 접속
2. **승인 대기** 필터로 검토할 상품 확인
3. 상품 정보 검토
   - 이미지 확인
   - 가격, 설명 등 내용 확인
   - 파트너 정보 확인
4. 승인 또는 거부
   - **승인** - 즉시 웹에 게시
   - **거부** - 거부 사유 입력 (파트너에게 전달)

---

## 🔍 테스트 시나리오

### 시나리오 1: 파트너 상품 등록
1. 파트너로 로그인
2. 상품 등록
3. 상품 목록에서 "승인 대기" 배지 확인
4. 일반 사용자로 상품 페이지 접속 시 404 (게시 안 됨)

### 시나리오 2: 관리자 승인
1. 관리자로 로그인
2. 승인 관리 페이지 접속
3. 상품 승인
4. 일반 사용자로 상품 페이지 접속 시 정상 표시

### 시나리오 3: 관리자 거부
1. 관리자로 로그인
2. 승인 관리 페이지 접속
3. 상품 거부 (사유: "이미지 품질 불량")
4. 파트너 페이지에서 거부 사유 확인

### 시나리오 4: 파트너 상품 수정 후 재승인
1. 파트너로 거부된 상품 수정
2. 수정 후 다시 "승인 대기" 상태로 변경
3. 관리자 재검토 필요

---

## 🎨 UI 스크린샷 설명

### 파트너 페이지
- 승인 상태 배지 (노란색/초록색/빨간색)
- 거부 사유 박스 (빨간색 배경)

### 관리자 승인 관리 페이지
- 상태별 필터 드롭다운
- 상품 카드 레이아웃 (이미지 + 정보)
- 승인/거부 버튼
- 거부 다이얼로그 (사유 입력)

---

## ⚠️ 주의사항

1. **환경 변수 필수**
   - `JWT_SECRET` 환경 변수 설정 필요
   - 설정하지 않으면 인증 실패

2. **기존 데이터 마이그레이션**
   - 기존 상품들은 `approvalStatus`가 undefined
   - 다음 스크립트로 기존 상품을 'approved'로 설정 권장:
   ```javascript
   // scripts/migrate-approval-status.js
   await Product.updateMany(
     { approvalStatus: { $exists: false } },
     { $set: { approvalStatus: 'approved' } }
   );
   ```

3. **파트너 상품 수정 시 재승인**
   - 상품 수정 시 자동으로 pending 상태로 변경
   - 관리자가 다시 승인해야 웹에 게시

4. **카테고리 value 통일**
   - 기존: `'신선식품'`, `'의류'` 등 (한글)
   - 변경: `'fresh-food'`, `'clothing'` 등 (영문)
   - 기존 상품 데이터 마이그레이션 필요

---

## 🔄 데이터 마이그레이션 스크립트

기존 상품 데이터를 새로운 구조에 맞게 업데이트하는 스크립트:

```javascript
// scripts/migrate-products.js
const connectDB = require('../src/lib/db');
const Product = require('../src/models/Product');

const categoryMapping = {
  '신선식품': 'fresh-food',
  '의류': 'clothing',
  '신발': 'shoes',
  '가방': 'bags',
  '액세서리': 'accessories',
  '라이프스타일': 'lifestyle',
  '전자제품': 'electronics',
  '뷰티': 'beauty',
  '스포츠': 'sports',
  '도서': 'books',
};

async function migrate() {
  await connectDB();
  
  // 1. 승인 상태 추가 (기존 상품은 모두 approved)
  await Product.updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: 'approved' } }
  );
  
  // 2. 카테고리 변환 (한글 → 영문)
  for (const [oldValue, newValue] of Object.entries(categoryMapping)) {
    await Product.updateMany(
      { category: oldValue },
      { $set: { category: newValue } }
    );
  }
  
  console.log('✅ 마이그레이션 완료');
}

migrate();
```

---

## 📚 추가 개선 사항 (향후)

1. **알림 시스템**
   - 파트너: 승인/거부 시 이메일 또는 푸시 알림
   - 관리자: 새 상품 등록 시 알림

2. **승인 히스토리**
   - 승인/거부 이력 저장
   - 관리자별 승인 통계

3. **일괄 승인**
   - 여러 상품 선택 후 일괄 승인

4. **자동 승인 조건**
   - 신뢰도 높은 파트너는 자동 승인
   - 특정 카테고리는 자동 승인

5. **승인 기한**
   - N일 이내 미승인 시 자동 거부 또는 알림

---

## ✅ 체크리스트

- [x] Product 모델에 승인 상태 필드 추가
- [x] 파트너 API 수정 (토큰 통일, pending 상태)
- [x] 관리자 API에 카테고리별 특화 정보 추가
- [x] 관리자 승인/거부 API 생성
- [x] 일반 사용자용 API 수정 (approved만 조회)
- [x] 카테고리 목록 통일
- [x] 파트너 페이지 UI 업데이트 (승인 상태 표시)
- [x] 관리자 승인 관리 페이지 생성
- [ ] 데이터 마이그레이션 스크립트 실행
- [ ] 테스트 수행
- [ ] 프로덕션 배포

---

## 🎉 완료!

파트너 상품 승인 시스템이 완벽하게 구현되었습니다!

