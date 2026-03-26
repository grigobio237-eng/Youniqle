# Youniqle 프로그램 다이어트 플랜

> **목표**: 불필요하거나 미완성된 기능을 제거하여 코드베이스를 가볍고 유지보수하기 쉽게 만든다.

> **원칙**: 각 단계 진행 전 반드시 Git 커밋(백업)을 먼저 하고, 삭제 후 `npm run build` 에러가 없는지 확인한다.

---

## 1단계: 즉시 삭제 가능 (빈 폴더 & 껍데기 파일)

사용 여부 확인 없이 바로 삭제해도 되는 항목입니다.

| 경로 | 이유 |
|---|---|
| `src/app/admin/omakase` | 빈 디렉토리 (파일 없음) |
| `src/app/convention` | 617byte 껍데기 파일만 존재 |
| `src/app/lounge` | 1,279byte 스텁 수준의 페이지 |
| `src/app/test-checklist` | 개발 전용 테스트 경로 |
| `src/app/test-setup` | 개발 전용 테스트 경로 |
| `src/app/api/debug` | 개발 전용, 운영 환경 불필요 |
| `src/app/api/debug-upload` | 개발 전용, 운영 환경 불필요 |
| `src/app/api/test` | 개발 전용, 운영 환경 불필요 |

---

## 2단계: 관리자 페이지 미완성/중복 기능 제거

실제 사용 여부가 낮거나 초기 서비스에 과도한 기능들입니다.

| 경로 | 파일 크기 | 판단 근거 |
|---|---|---|
| `src/app/admin/ai-builder` | 1,860byte | 내용이 매우 적음, 미완성으로 추정 |
| `src/app/admin/ab-tests` | 22,992byte | 초기 서비스에 과도한 기능 |
| `src/app/admin/segments` | 21,203byte | 고객 세그먼트 분류, 초기엔 불필요 |
| `src/app/admin/personalization` | 16,547byte | 개인화 설정, 우선순위 낮음 |
| `src/app/admin/recommendations` | 17,444byte | 추천 알고리즘 관리, 분리 운영 가능 |
| `src/app/admin/recovery` | - | 복구 관리 기능, 사용 빈도 낮음 |

---

## 3단계: 사용자 서비스 페이지 정리

방향이 불명확하거나 다른 페이지와 중복 가능한 항목입니다.

| 경로 | 판단 근거 |
|---|---|
| `src/app/ai-advice` | `/ai-navigator`와 역할 중복 가능성 |
| `src/app/cases` | 콘텐츠가 없으면 빈 페이지 |
| `src/app/partner` | `/partners`와 중복, 하나로 통합 가능 |
| `src/app/healing-center` | `/community`와 역할 검토 필요 |
| `src/app/founder-pass` | 파운더 모집 종료 시 숨기기 가능 |

---

## 4단계: API 엔드포인트 정리

| 경로 | 판단 |
|---|---|
| `/api/character` | 사용처 확인 후 삭제 검토 |
| `/api/concierge` | 사용처 확인 후 삭제 검토 |
| `/api/postcode` | 외부 서비스 전환 가능 여부 확인 |

---

## 5단계: 패키지(npm) 정리

코드 정리 후 사용하지 않는 패키지 제거.

```bash
# 미사용 패키지 탐지
npx depcheck

# 패키지 제거
npm uninstall <불필요한 패키지명>
```

---

## 진행 순서 요약

```
1단계(즉시 삭제) → 빌드 확인
→ 2단계(관리자 정리) → 빌드 확인
→ 3단계(사용자 페이지 정리) → 빌드 확인
→ 4단계(API 정리) → 빌드 확인
→ 5단계(패키지 정리) → 최종 빌드 및 배포
```

---

## 삭제 전 확인이 필요한 항목

아래 항목들은 삭제 전 사용자와 협의가 필요합니다.

1. `/ai-navigator` vs `/ai-advice` — 두 기능이 서로 다른가요?
2. `/admin/ab-tests` — 현재 A/B 테스트를 운영 중인가요?
3. `/partner` vs `/partners` — 두 페이지가 다른 용도인가요?
4. `/healing-center` — `/community`와 다른 기능인가요?
5. `debug` API — 이미 접근 차단이 됐나요?
