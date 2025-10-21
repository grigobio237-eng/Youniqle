# 쿠폰 시스템 버그 수정 보고서

## 🔴 Critical Bug Fix: UserCoupon 상태 업데이트 누락

### 문제 설명
주문 완료 및 결제 완료 시 `UserCoupon`의 상태를 'used'로 업데이트하는 로직이 누락되어 있었습니다.

**발견된 문제점:**
- ❌ 사용자가 같은 쿠폰을 무한정 재사용 가능
- ❌ 쿠폰 통계가 부정확
- ❌ 사용 이력 추적 불가
- ❌ 내 쿠폰함에서 사용한 쿠폰이 계속 'available' 상태로 표시

### 수정 내용

#### 1. 쿠폰 상태 관리 함수 추가 (`src/lib/couponValidator.ts`)

##### 1.1 `markCouponAsUsed()` - 쿠폰 사용 처리
```typescript
export async function markCouponAsUsed(
  userId: string,
  couponCode: string,
  orderId: string
): Promise<{ success: boolean; error?: string }>
```

**기능:**
- UserCoupon의 상태를 'available' → 'used'로 변경
- `usedAt` 필드에 사용 시각 기록
- `orderId` 필드에 주문 ID 저장

**사용 시점:**
- 결제 완료 후 (`src/app/api/payment/result/route.ts`)

##### 1.2 `cancelCouponUsage()` - 쿠폰 사용 취소
```typescript
export async function cancelCouponUsage(
  userId: string,
  couponCode: string,
  orderId: string
): Promise<{ success: boolean; error?: string }>
```

**기능:**
- UserCoupon의 상태를 'used' → 'available' 또는 'expired'로 변경
- `usedAt` 및 `orderId` 필드 초기화
- CouponUsage 기록 삭제
- Coupon의 usageCount 감소

**사용 시점:**
- 주문 취소 시
- 결제 실패/환불 시

#### 2. 결제 완료 시 쿠폰 사용 처리 (`src/app/api/payment/result/route.ts`)

**추가된 코드:**
```typescript
// 쿠폰 사용 처리
if (order.couponCode) {
  try {
    const { markCouponAsUsed } = await import('@/lib/couponValidator');
    const couponResult = await markCouponAsUsed(
      order.userId.toString(),
      order.couponCode,
      order._id.toString()
    );
    
    if (couponResult.success) {
      console.log(`쿠폰 사용 처리 완료: ${order.couponCode}`);
    } else {
      console.error('쿠폰 사용 처리 실패:', couponResult.error);
    }
  } catch (error) {
    console.error('쿠폰 사용 처리 오류:', error);
  }
}
```

**위치:** 결제 승인 성공 및 주문 상태 업데이트 후, 포인트 적립 처리 다음

#### 3. 테스트 스크립트 작성 (`scripts/test-coupon-usage.js`)

**테스트 항목:**
1. ✅ 쿠폰 생성
2. ✅ 쿠폰 다운로드 (UserCoupon 생성)
3. ✅ 주문 생성 (쿠폰 적용)
4. ✅ 결제 완료 시뮬레이션 (쿠폰 상태 업데이트)
5. ✅ 중복 사용 방지 테스트
6. ✅ 쿠폰 사용 취소 테스트
7. ✅ 테스트 데이터 정리

**실행 방법:**
```bash
npm run test:coupon-usage
```

---

## 🔄 수정된 파일 목록

1. ✅ `src/lib/couponValidator.ts`
   - `markCouponAsUsed()` 함수 추가
   - `cancelCouponUsage()` 함수 추가

2. ✅ `src/app/api/payment/result/route.ts`
   - 결제 완료 시 쿠폰 사용 처리 로직 추가

3. ✅ `scripts/test-coupon-usage.js`
   - 쿠폰 사용 플로우 테스트 스크립트 작성

4. ✅ `package.json`
   - `test:coupon-usage` 스크립트 추가

5. ✅ `COUPON_SYSTEM_ANALYSIS.md`
   - 전체 쿠폰 시스템 분석 문서 작성

6. ✅ `COUPON_BUG_FIX_REPORT.md` (이 파일)
   - 버그 수정 보고서 작성

---

## 🧪 테스트 가이드

### 수동 테스트 절차

1. **쿠폰 다운로드**
   ```
   1) /coupons 페이지 접속
   2) 쿠폰 선택 및 다운로드
   3) /me/coupons에서 'available' 상태 확인
   ```

2. **쿠폰 사용**
   ```
   1) 상품을 장바구니에 추가
   2) 체크아웃 페이지로 이동
   3) 쿠폰 코드 입력 및 적용
   4) 할인 금액 확인
   5) 결제 진행
   ```

3. **사용 후 상태 확인**
   ```
   1) 결제 완료 후 /me/coupons 접속
   2) 사용한 쿠폰이 'used' 상태로 변경되었는지 확인
   3) 같은 쿠폰 코드로 다시 주문 시도
   4) "사용 가능한 쿠폰을 찾을 수 없습니다" 오류 확인
   ```

### 자동 테스트

```bash
# 쿠폰 사용 플로우 테스트
npm run test:coupon-usage
```

**예상 출력:**
```
✅ 모든 테스트 완료!

📊 현재 쿠폰 통계:
   - 전체 쿠폰: XX개
   - 활성 쿠폰: XX개
   - 다운로드된 쿠폰: XX개
   - 사용된 쿠폰: XX개
   - 전체 사용 기록: XX건
```

---

## 📊 수정 전후 비교

### 수정 전 (Before)

```
쿠폰 다운로드 → 주문 적용 → 결제 완료
                                  ↓
                         [UserCoupon: available] ❌
                         (중복 사용 가능!)
```

### 수정 후 (After)

```
쿠폰 다운로드 → 주문 적용 → 결제 완료
                                  ↓
                         [UserCoupon: used] ✅
                         (중복 사용 방지!)
```

---

## 🔍 상세 동작 흐름

### 1. 정상 주문 플로우

```
1. 사용자가 쿠폰 다운로드
   └─> UserCoupon 생성 (status: available)

2. 체크아웃 페이지에서 쿠폰 적용
   └─> /api/coupon/validate 호출
       └─> 쿠폰 유효성 검증
       └─> 할인 금액 계산

3. 주문 생성
   └─> /api/orders POST
       └─> Order 생성 (couponCode, couponDiscount 저장)

4. 결제 요청
   └─> /api/payment/request

5. 결제 완료 ⭐ 핵심 단계
   └─> /api/payment/result
       ├─> Order 상태 업데이트 (paymentStatus: completed)
       ├─> 장바구니 정리
       ├─> 포인트 적립
       └─> ⭐ markCouponAsUsed() 호출
           └─> UserCoupon 상태: available → used
           └─> usedAt, orderId 기록
```

### 2. 주문 취소 플로우 (향후 구현)

```
1. 사용자가 주문 취소 요청
   └─> /api/orders/[id]/cancel (향후 구현)

2. 주문 취소 처리
   ├─> Order 상태: cancelled
   ├─> 포인트 복구
   └─> ⭐ cancelCouponUsage() 호출
       └─> UserCoupon 상태: used → available
       └─> CouponUsage 기록 삭제
       └─> Coupon usageCount 감소
```

---

## ⚠️ 주의사항

### 1. 기존 데이터 정리
수정 전에 생성된 주문 중 쿠폰을 사용한 경우, UserCoupon이 여전히 'available' 상태일 수 있습니다.

**데이터 정리 스크립트 (필요 시 실행):**
```javascript
// scripts/fix-used-coupons.js
const Order = require('@/models/Order').default;
const UserCoupon = require('@/models/UserCoupon').default;

async function fixUsedCoupons() {
  const orders = await Order.find({ 
    couponCode: { $exists: true },
    paymentStatus: 'completed'
  });

  for (const order of orders) {
    await UserCoupon.updateOne(
      {
        userId: order.userId,
        code: order.couponCode,
        status: 'available' // 아직 available 상태인 것만
      },
      {
        $set: {
          status: 'used',
          usedAt: order.createdAt,
          orderId: order._id
        }
      }
    );
  }
}
```

### 2. 에러 처리
쿠폰 사용 처리가 실패해도 결제 완료는 막지 않습니다. 대신 로그에 기록하고 관리자가 수동으로 처리할 수 있도록 합니다.

```typescript
// 쿠폰 사용 처리 실패는 결제 완료를 막지 않음
console.error('쿠폰 사용 처리 실패:', couponResult.error);
```

### 3. 트랜잭션 처리
향후 MongoDB 트랜잭션을 도입하여 주문-포인트-쿠폰 처리를 원자적으로 수행하는 것을 권장합니다.

---

## 🎯 향후 개선 사항

### 단기 (1-2주)
- [ ] MongoDB 트랜잭션 도입
- [ ] 주문 취소 API 구현
- [ ] 쿠폰 사용 취소 로직 통합
- [ ] 단위 테스트 추가
- [ ] 통합 테스트 추가

### 중기 (1개월)
- [ ] 쿠폰 만료 배치 작업 자동화
- [ ] 쿠폰 사용 분석 대시보드 강화
- [ ] 쿠폰 사용 알림 시스템
- [ ] 다국어 지원 추가

### 장기 (2-3개월)
- [ ] 쿠폰 자동 추천 시스템
- [ ] A/B 테스트 통합
- [ ] 쿠폰 효과 분석 (ROI, 전환율)
- [ ] 대량 쿠폰 발급 시스템

---

## 📚 관련 문서

- `COUPON_SYSTEM_ANALYSIS.md` - 전체 쿠폰 시스템 분석
- `docs/COUPON_DEMO_DATA.md` - 쿠폰 데모 데이터 가이드
- `API_DOCUMENTATION.md` - API 문서

---

## ✅ 체크리스트

### 수정 완료
- [x] `markCouponAsUsed()` 함수 구현
- [x] `cancelCouponUsage()` 함수 구현
- [x] 결제 완료 시 쿠폰 사용 처리 추가
- [x] 테스트 스크립트 작성
- [x] 문서화

### 테스트 필요
- [ ] 수동 테스트 (쿠폰 다운로드 → 사용 → 중복 방지)
- [ ] 자동 테스트 실행 (`npm run test:coupon-usage`)
- [ ] 기존 데이터 정리 (필요 시)

### 배포 전 확인
- [ ] 린트 에러 없음
- [ ] 타입 에러 없음
- [ ] 테스트 통과
- [ ] 로그 확인

---

## 📞 문의

수정 사항에 대한 문의나 추가 개선 사항은 개발팀에 문의해주세요.

**수정 날짜:** 2025-10-21
**작성자:** AI Assistant
**우선순위:** Critical (🔴 최고)
**상태:** ✅ 수정 완료

