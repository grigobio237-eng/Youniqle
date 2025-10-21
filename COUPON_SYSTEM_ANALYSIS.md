# 쿠폰 시스템 분석 및 개선 필요 사항

## 📊 현재 구현 상태

### ✅ 구현 완료된 기능

#### 1. 데이터 모델 (Models)
- **Coupon.ts**: 쿠폰 마스터 정보
  - 다양한 할인 유형 지원 (percentage, fixed, free_shipping)
  - 사용 제한 및 조건 설정
  - 유효기간 관리 (고정 기간 / 다운로드 시점부터)
  - 대상 고객 설정
  - 상품/카테고리 제한

- **UserCoupon.ts**: 사용자별 쿠폰 정보
  - 다운로드한 쿠폰 추적
  - 사용자별 유효기간 관리
  - 상태 관리 (available, used, expired)

- **CouponUsage.ts**: 쿠폰 사용 이력
  - 사용 통계 추적
  - 할인 금액 기록

#### 2. 쿠폰 검증 로직 (couponValidator.ts)
- 쿠폰 코드 유효성 검증
- 유효기간 확인
- 사용 횟수 제한 검증
- 최소 주문 금액 확인
- 사용자 조건 검증 (주문 횟수, 총 구매 금액, 등급)
- 상품/카테고리 적용 조건 확인
- 할인 금액 계산
- 쿠폰 사용 기록 생성

#### 3. API 엔드포인트
**공개 API:**
- `GET /api/coupons` - 사용 가능한 쿠폰 목록 조회
- `POST /api/coupon/validate` - 쿠폰 검증
- `POST /api/coupon/use` - 쿠폰 사용 (사용 기록 생성)
- `POST /api/coupons/download` - 쿠폰 다운로드
- `GET /api/me/coupons` - 내 쿠폰함 조회

**관리자 API:**
- `GET /api/admin/coupons` - 쿠폰 관리 목록 (통계 포함)
- `POST /api/admin/coupons` - 쿠폰 생성
- `GET /api/admin/coupons/[id]` - 쿠폰 상세 조회
- `PUT /api/admin/coupons/[id]` - 쿠폰 수정
- `DELETE /api/admin/coupons/[id]` - 쿠폰 삭제

#### 4. 사용자 인터페이스
- `/coupons` - 쿠폰 다운로드 센터
  - 공개 쿠폰 목록 표시
  - 쿠폰 코드 직접 입력
  - 쿠폰 다운로드 기능
  
- `/me/coupons` - 내 쿠폰함
  - 보유 쿠폰 목록
  - 상태별 필터링 (available, used, expired)
  - 통계 표시

- `/admin/coupons` - 관리자 쿠폰 관리
  - 쿠폰 목록 및 검색
  - 통계 대시보드
  - 쿠폰 생성/수정/삭제

- `/admin/coupons/create` - 쿠폰 생성
  - 상세한 쿠폰 설정 폼
  - 유효성 검증

- `/admin/coupons/[id]` - 쿠폰 수정
  - 기존 쿠폰 정보 편집

- `/admin/coupons/analytics` - 쿠폰 사용 분석
  - TOP 10 사용 쿠폰
  - 통계 정보

#### 5. 체크아웃 통합
- 쿠폰 코드 입력 및 적용
- 실시간 할인 금액 계산
- 주문 금액에 쿠폰 할인 반영

---

## ⚠️ 누락되거나 개선이 필요한 부분

### 1. 🔴 **중요: UserCoupon 상태 업데이트 누락**

**문제점:**
- 주문 완료 시 `UserCoupon`의 `status`를 'used'로 업데이트하는 로직이 없음
- 결제 완료 후에도 쿠폰이 'available' 상태로 남아있어 중복 사용 가능

**영향:**
- 사용자가 같은 쿠폰을 여러 번 사용할 수 있는 심각한 버그
- 쿠폰 통계가 정확하지 않음
- 사용 이력 추적 불가

**해결 방안:**
```typescript
// src/app/api/orders/route.ts 또는 결제 완료 후 처리 로직에 추가
if (couponCode) {
  // UserCoupon 상태 업데이트
  await mongoose.model('UserCoupon').updateOne(
    {
      userId: user._id,
      code: couponCode,
      status: 'available'
    },
    {
      $set: {
        status: 'used',
        usedAt: new Date(),
        orderId: order._id
      }
    }
  );
}
```

**추가 구현 위치:**
- `src/app/api/payment/result/route.ts` - 결제 완료 후 처리
- `src/app/api/orders/[id]/confirm-payment/route.ts` - 주문 확인 시

---

### 2. 🟡 **쿠폰 사용 플로우 개선**

**현재 문제:**
- `/api/coupon/use` 엔드포인트가 있지만 실제 주문 프로세스에서 호출되지 않음
- `checkout` 페이지에서 `/api/coupon/validate`만 호출하고 실제 사용 처리는 누락

**개선 방안:**
1. **주문 생성 시 쿠폰 사용 처리 통합**
   ```typescript
   // src/app/api/orders/route.ts에서
   if (couponCode && couponDiscount > 0) {
     // 1. 쿠폰 재검증
     const validationResult = await validateCoupon({...});
     
     // 2. CouponUsage 기록 생성
     await recordCouponUsage(...);
     
     // 3. UserCoupon 상태 업데이트
     await updateUserCouponStatus(...);
     
     // 4. Coupon usageCount 증가
     await Coupon.updateOne(...);
   }
   ```

2. **트랜잭션 처리**
   - MongoDB 트랜잭션을 사용하여 주문-쿠폰-포인트 처리를 원자적으로 수행

---

### 3. 🟡 **쿠폰 만료 처리 자동화**

**현재 상태:**
- `Coupon` 모델에 만료 상태 자동 업데이트 pre-save 훅 존재
- `UserCoupon` 만료 처리는 조회 시에만 수동으로 체크

**개선 방안:**
1. **배치 작업 추가**
   ```typescript
   // scripts/expire-coupons.ts
   async function expireCoupons() {
     const now = new Date();
     
     // Coupon 만료 처리
     await Coupon.updateMany(
       { validUntil: { $lt: now }, status: 'active' },
       { $set: { status: 'expired' } }
     );
     
     // UserCoupon 만료 처리
     await UserCoupon.updateMany(
       { validUntil: { $lt: now }, status: 'available' },
       { $set: { status: 'expired' } }
     );
   }
   ```

2. **스케줄러 설정**
   - cron job 또는 node-cron을 사용하여 매일 자동 실행

---

### 4. 🟡 **다국어 지원 부족**

**문제점:**
- 쿠폰 관련 텍스트가 하드코딩되어 있음
- 오류 메시지, UI 텍스트 등이 한국어로만 제공

**개선 방안:**
```typescript
// src/locales/ko.json, en.json, zh.json에 추가
{
  "coupon": {
    "title": "쿠폰",
    "download": "쿠폰 받기",
    "apply": "쿠폰 적용",
    "code": "쿠폰 코드",
    "errors": {
      "invalid": "유효하지 않은 쿠폰 코드입니다",
      "expired": "만료된 쿠폰입니다",
      "already_used": "이미 사용한 쿠폰입니다",
      // ...
    }
  }
}
```

---

### 5. 🟢 **추가 기능 제안**

#### 5.1 쿠폰 자동 적용
- 사용자가 보유한 쿠폰 중 가장 유리한 쿠폰을 자동으로 추천
- "최대 할인 쿠폰 적용하기" 버튼

#### 5.2 쿠폰 알림
- 보유 쿠폰 만료 임박 시 알림 (예: 3일 전)
- 새로운 쿠폰 발행 시 알림

#### 5.3 쿠폰 공유 기능
- 친구 초대 쿠폰
- SNS 공유 시 쿠폰 발급

#### 5.4 쿠폰 조합 사용
- 여러 쿠폰을 동시에 사용 가능하도록 (설정에 따라)
- 예: 배송비 무료 쿠폰 + 할인 쿠폰

#### 5.5 쿠폰 A/B 테스트 통합
- 이미 구현된 A/B 테스트 시스템과 연동
- 쿠폰 효과 측정 및 최적화

#### 5.6 쿠폰 분석 강화
- 쿠폰별 전환율 분석
- ROI 계산
- 사용자 세그먼트별 쿠폰 효과
- 시계열 분석 (일별/주별/월별)

#### 5.7 쿠폰 템플릿
- 자주 사용하는 쿠폰 설정을 템플릿으로 저장
- 빠른 쿠폰 생성

#### 5.8 대량 쿠폰 발급
- CSV 업로드로 사용자별 쿠폰 발급
- 이메일 자동 발송

---

## 🔧 즉시 수정이 필요한 버그

### 1. **UserCoupon 상태 업데이트 누락** (Critical)
- **우선순위**: 최고
- **영향도**: 심각 (중복 사용 가능)
- **예상 작업 시간**: 2-3시간

### 2. **쿠폰 검증과 사용 처리 분리** (High)
- **우선순위**: 높음
- **영향도**: 중간 (사용자 경험 저하)
- **예상 작업 시간**: 3-4시간

### 3. **트랜잭션 처리 추가** (High)
- **우선순위**: 높음
- **영향도**: 중간 (데이터 일관성)
- **예상 작업 시간**: 4-5시간

---

## 📝 테스트 체크리스트

### 단위 테스트 필요
- [ ] 쿠폰 검증 로직
- [ ] 할인 금액 계산
- [ ] 사용자 조건 검증
- [ ] 상품 적용 조건

### 통합 테스트 필요
- [ ] 쿠폰 다운로드 → 적용 → 주문 → 사용 완료 플로우
- [ ] 쿠폰 중복 사용 방지
- [ ] 쿠폰과 포인트 동시 사용
- [ ] 쿠폰 만료 처리

### 엣지 케이스 테스트
- [ ] 쿠폰 사용 중 재고 소진
- [ ] 동시에 같은 쿠폰 사용 시도
- [ ] 주문 취소 시 쿠폰 복구
- [ ] 결제 실패 시 쿠폰 상태 롤백

---

## 📚 문서화 필요
- [ ] 쿠폰 시스템 사용자 가이드
- [ ] 쿠폰 관리자 매뉴얼
- [ ] API 문서 업데이트
- [ ] 쿠폰 설정 모범 사례

---

## 🎯 권장 작업 순서

1. **즉시 수정** (1-2일)
   - UserCoupon 상태 업데이트 로직 추가
   - 주문 프로세스에 쿠폰 사용 처리 통합

2. **단기 개선** (3-5일)
   - 트랜잭션 처리 추가
   - 만료 처리 자동화
   - 테스트 코드 작성

3. **중기 개선** (1-2주)
   - 다국어 지원 추가
   - 쿠폰 자동 적용 기능
   - 쿠폰 알림 시스템

4. **장기 개선** (2-4주)
   - 고급 분석 기능
   - A/B 테스트 통합
   - 쿠폰 템플릿 및 대량 발급

---

## 💡 참고사항

### 보안 고려사항
- 쿠폰 코드 브루트포스 공격 방지 (rate limiting)
- 쿠폰 코드 예측 불가능하게 생성
- 관리자 권한 체크 강화

### 성능 고려사항
- 쿠폰 검증 시 캐싱 활용
- 인덱스 최적화 (특히 userId, status 복합 인덱스)
- 대량 쿠폰 발급 시 배치 처리

### 확장성 고려사항
- 쿠폰 시스템을 독립 마이크로서비스로 분리 가능하도록 설계
- 이벤트 기반 아키텍처 도입 검토 (쿠폰 사용 → 이벤트 발행)

