# 🎯 Youniqle 멤버십 4-Tier 차등 적용 설계안

## 현재 시스템 분석 결과

### 기존 구조의 문제점

현재 프로젝트에는 **두 가지 등급 체계가 혼재**되어 있습니다:

| 구분 | 기존 passInfo.type (DB) | 멤버십 페이지 표시 | 비고 |
|------|------------------------|------------------|------|
| 구매 패스 | `NONE`, `START`, `SIGNATURE`, `BLACK` | ❌ 불일치 | DB 스키마 기준 |
| 멤버십 카드 | `RESET`, `REBORN`, `RESTART`, `BLACK` | ✅ 표시됨 | 사용자에게 노출 |
| 접근 제어 | `NORMAL`, `START`, `PREMIUM` | - | access-control.ts |
| 유저 유틸 | `RESET`, `REBORN`, `RESTART` | - | user-utils.ts |

> [!WARNING]
> **핵심 문제**: DB의 `passInfo.type`은 `NONE/START/SIGNATURE/BLACK`인데, 멤버십 UI는 `RESET/REBORN/RESTART/BLACK`으로 표시되어 있어 **매핑이 일관적이지 않습니다.** 접근 제어도 `NORMAL/START/PREMIUM` 3단계로만 구분하고 있어, 새로운 4-Tier와 정확히 맞지 않습니다.

---

## 제안: 통합 4-Tier 멤버십 설계

### Tier 정의

```
RESET (무료) → REBORN (월 19,900원) → RESTART (월 49,900원) → BLACK (개별 상담)
```

| Tier | 포지션 | 핵심 가치 | 기간 |
|------|--------|----------|------|
| **Reset** | 멈추기·돌아보기 | 나의 유형 확인, 첫 효능감 | 무료 |
| **Reborn** | 기본기 채우기 | 기록 저장, 주간 루틴, 데이터 축적 | 월 19,900원 |
| **Restart** | 습관 굳히기 | 정밀 분석, 리포트 정리, 가이드 | 월 49,900원 |
| **Black** | 프라이빗 컨시어지 | 맞춤 루틴, 비공개 상담, 전문 연계 | 개별 안내 |

---

## 기능별 차등 적용 매트릭스

### 1. 📸 스캐너 (자세/식단/공간 분석)

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 일일 스캔 횟수 | 1회 | 5회 | 무제한 | 무제한 |
| 스캔 카테고리 | 식단만 | 식단 + 자세 | 전체(식단/자세/공간/POST_OP) | 전체 |
| 분석 리포트 수준 | 기본 점수만 | 점수 + 요약 코멘트 | 점수 + AI 심층 분석 + 개선 제안 | 전담팀 분석 리포트 |
| 스캔 히스토리 보관 | 7일 | 90일 | 전체 기간 | 전체 기간 |

> **현재 코드 위치**: [access-control.ts](file:///f:/youniqle/src/lib/logic/access-control.ts) - `TIER_LIMITS` 수정 필요

---

### 2. 🩺 진단 (1일 회복 / 24문항 / 60문항)

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 1일 회복진단 (16문항) | ✅ 가능 | ✅ 가능 | ✅ 가능 | ✅ 가능 |
| 24문항 약식 진단 | ✅ 1회 체험 | ✅ 무제한 | ✅ 무제한 | ✅ 무제한 |
| 60문항 정밀 진단 | 🔒 잠금 | 🔒 잠금 | ✅ 무제한 | ✅ 무제한 |
| 진단 리포트 깊이 | Basic (4영역 점수) | Basic + AI 요약 | Premium (Big5 + 30 facets) | Premium + 전문가 해석 |
| 진단 히스토리 비교 | ❌ | ✅ 최근 3회 | ✅ 전체 추이 그래프 | ✅ 전체 + 전담 분석 |

> **현재 코드 위치**: 
> - [diagnosis/report/page.tsx](file:///f:/youniqle/src/app/diagnosis/report/page.tsx) - `isPaid` 로직을 Tier별로 세분화
> - [ai-navigator/page.tsx](file:///f:/youniqle/src/app/ai-navigator/page.tsx) - 개인화 탭 내 진단 카드 표시 조건

---

### 3. 🧭 AI 네비게이터 (Youniqle 진단 페이지)

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 개인화 탭 접근 | ✅ 기본 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 클리닉 탭 접근 | 🔒 잠금 | 🔒 잠금 | ✅ 가능 | ✅ 가능 |
| 내일 예보 | ❌ | ✅ 기본 | ✅ AI 정밀 예보 | ✅ 전담 브리핑 |
| 추천 회복 도구 | 일부 무료 | 전체 열람 | 전체 + 맞춤 큐레이션 | 전체 + 독점 프로그램 |
| 1:1 상담 요청 | ❌ | 월 1회 | 월 3회 | 무제한 |

---

### 4. 📋 면담 가이드 & 회복 로드맵

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 면담 가이드 작성 | 🔒 잠금 | 🔒 잠금 | ✅ 무제한 | ✅ 무제한 |
| 회복 로드맵 생성 | 🔒 잠금 | 🔒 잠금 | ✅ 무제한 | ✅ 무제한 |
| PDF 다운로드 | 🔒 잠금 | 🔒 잠금 | ✅ 가능 | ✅ 가능 |
| 네비게이터 상담 연동 | ❌ | ❌ | ✅ 가능 | ✅ 전담 |

> **현재 코드 위치**: 
> - [event/consultation/page.tsx](file:///f:/youniqle/src/app/event/consultation/page.tsx) - 게이트웨이 페이지에 Tier 체크 추가
> - [event/post-care/page.tsx](file:///f:/youniqle/src/app/event/post-care/page.tsx) - 게이트웨이 페이지에 Tier 체크 추가

---

### 5. 📊 대시보드

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 회복 지수 표시 | ✅ 기본 | ✅ 상세 | ✅ 상세 + 추이 | ✅ 전체 |
| 매니저 리포트 | 고정 메시지 | AI 기본 코멘트 | AI 정밀 분석 코멘트 | 전담 매니저 코멘트 |
| 일일 체크리스트 | 4개 고정 | 4개 고정 | 맞춤형 항목 추가 가능 | 전담팀 설계 루틴 |
| 맞춤 솔루션 리포트 | 기본 | 기본 + 상품 추천 | 정밀 + 프로토콜 | VIP 컨시어지 |
| Recommended Tools | 일부 | 전체 | 전체 + 프리미엄 | 전체 + 독점 |

> **현재 코드 위치**: [DashboardPreview.tsx](file:///f:/youniqle/src/components/home/DashboardPreview.tsx) - `membershipLevel` 변수 활용

---

### 6. 🎧 사운드 테라피 & 유틸리티

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 바이노럴 비트 | 기본 2곡 | 전체 라이브러리 | 전체 + 맞춤 주파수 | 전체 + 독점 |
| 자세 분석 | ❌ | ✅ 기본 | ✅ 정밀 | ✅ 정밀 + 추적 |
| 호흡 가이드 | ✅ 기본 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 비디오 분석 | ❌ | ❌ | ✅ 가능 | ✅ 가능 |

---

### 7. 🛒 상품 & 리워드

| 기능 | Reset | Reborn | Restart | Black |
|------|-------|--------|---------|-------|
| 상점 접근 | ✅ 열람 | ✅ 구매 가능 | ✅ 전용 할인 | ✅ 최상위 우대 |
| 포인트 적립률 | 기본 1% | 3% | 5% | 10% |
| 회복 키트 | ❌ | ❌ | 연 1회 | 연 2회 |
| 파트너사 우대 | ❌ | 기본 | 프리미엄 | VIP 전용 |

---

## 구현 우선순위 제안

### Phase 1: 데이터 모델 통합 (필수)
1. `User.passInfo.type` enum을 `NONE` → `RESET` → `REBORN` → `RESTART` → `BLACK`으로 변경
2. `access-control.ts`의 `UserGroup`을 4-Tier로 확장
3. `user-utils.ts`의 `calculateUserTier` 함수를 새 enum에 맞게 수정

### Phase 2: 핵심 게이팅 적용
1. 스캐너 일일 횟수 제한 (API 레벨)
2. 진단 타입별 접근 제어 (24문항/60문항 분리)
3. 클리닉 탭 잠금 처리 (UI 레벨)

### Phase 3: UX 차등화
1. 대시보드 매니저 리포트 메시지 차등
2. 진단 리포트 깊이 차등 (Basic vs Premium)
3. 잠금 해제 유도 UI (업그레이드 CTA)

### Phase 4: 프리미엄 경험
1. Black 전용 전담 매니저 시스템
2. 맞춤형 일일 체크리스트
3. 독점 콘텐츠 및 프로그램

---

## 수정이 필요한 핵심 파일 목록

| 파일 | 수정 내용 |
|------|----------|
| [User.ts](file:///f:/youniqle/src/models/User.ts#L173-L180) | `passInfo.type` enum에 `RESET`, `REBORN`, `RESTART` 추가 |
| [access-control.ts](file:///f:/youniqle/src/lib/logic/access-control.ts) | `UserGroup`을 4-Tier로 확장, `TIER_LIMITS` 4단계로 세분화 |
| [user-utils.ts](file:///f:/youniqle/src/lib/user-utils.ts) | `calculateUserTier` 함수를 새로운 매핑으로 수정 |
| [auth.ts](file:///f:/youniqle/src/lib/auth.ts#L229) | 세션에 tier 정보 포함하도록 수정 |
| [DashboardPreview.tsx](file:///f:/youniqle/src/components/home/DashboardPreview.tsx#L120) | `membershipLevel` 로직을 4-Tier 기반으로 수정 |
| [ai-navigator/page.tsx](file:///f:/youniqle/src/app/ai-navigator/page.tsx) | 클리닉 탭 접근 제어 추가 |
| [diagnosis/report/page.tsx](file:///f:/youniqle/src/app/diagnosis/report/page.tsx#L268) | `isPaid` 로직을 Tier별 세분화 |
| [membership/page.tsx](file:///f:/youniqle/src/app/membership/page.tsx) | 카드 UI와 DB 타입 일치시키기 |
| [event/consultation/page.tsx](file:///f:/youniqle/src/app/event/consultation/page.tsx) | Tier 체크 게이팅 추가 |
| [event/post-care/page.tsx](file:///f:/youniqle/src/app/event/post-care/page.tsx) | Tier 체크 게이팅 추가 |
| [scan/save/route.ts](file:///f:/youniqle/src/app/api/scan/save/route.ts) | 스캔 횟수 제한 4-Tier 적용 |
| [diagnosis/save/route.ts](file:///f:/youniqle/src/app/api/diagnosis/save/route.ts) | 진단 타입별 접근 제어 |
