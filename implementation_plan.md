# Implementation Plan - Hero Scanner 속성 고도화 및 모바일 흐름 버그 픽스

히어로 스캐너의 카메라 인식 범위를 식단 위주에서 **환경(Space)** 및 **상태(State)** 분석으로 확장하고, 회복 중심의 과학적 피드백을 강화합니다. 또한, 모바일 기기에서 대용량 사진 촬영/업로드 시 용량 제한으로 인해 대시보드로 튕기는 리디렉션 오류를 수정합니다.

## User Review Required

- **모바일 이미지 압축 도입 (필수)**: 모바일 고화질 카메라 촬영 시 이미지 크기(수 MB ~ 10MB+)가 서버 용량 제한(Vercel 4.5MB 등)을 초과하여 API 에러(413 Payload Too Large)가 발생하고, 이로 인해 catch 블록이 트리거되어 대시보드로 자동 튕기는 현상이 있습니다.
- **해결책**: 메인 홈 화면(`src/app/page.tsx`)의 `handleSnapComplete` 호출 전 이미지 데이터를 1024x1024 해상도의 webp 형식으로 리사이징/압축하는 헬퍼 함수(`compressImage`)를 적용하여 전송 용량을 수백 KB 이내로 보정합니다.

## Proposed Changes

### 🛒 UI 및 안내 문구 업데이트
#### [MODIFY] [HeroScanner.tsx](file:///f:/youniqle/src/components/home/HeroScanner.tsx)
- 카메라 안내 멘트를 통합적 메시지로 수정합니다.
- 하단 카테고리 뱃지를 MEAL, AREA, MEDS에서 MEAL, SPACE, STATE로 변경합니다.

### 🧠 AI 분석 엔진 고도화 & 모바일 버그 픽스
#### [MODIFY] [page.tsx](file:///f:/youniqle/src/app/page.tsx)
- `handleSnapComplete` 비동기 흐름 시작 부분에 canvas 기반의 `compressImage` 헬퍼 함수를 추가합니다.
- 이미지가 들어왔을 때 압축을 거친 뒤 `/api/ai/life-snap` API로 전송하게 하여 413 Payload Too Large 오류 및 대시보드 강제 리디렉션 현상을 완전히 해소합니다.

#### [MODIFY] [route.ts](file:///f:/youniqle/src/app/api/ai/food-analysis/route.ts)
- AI 시스템 프롬프트(Gemini)를 수정하여 이미지 내의 대상(음식, 공간, 신체 상태)을 자동 식별하고, 각 대상별 회복 지반 분석을 수행하도록 합니다.
- 응답 데이터 필드명을 범용적으로 수정합니다 (foodName -> subjectName 등).

## Verification Plan
- **모바일 실기기 테스트**: 모바일 폰에서 촬영 또는 고화질 갤러리 이미지 업로드 시, 대시보드로 튕기지 않고 정상적으로 3단계 분석 리포트 화면 및 60초 리듬체크로 진행되는지 검증.
- **PC 브라우저 에뮬레이터 테스트**: 기존의 분석 흐름이 하위 호환성 있게 완벽히 작동하는지 확인.
- **API 용량 체크**: 전송되는 payload 크기가 300KB 이하로 최적화되었는지 네트워크 탭 검증.
