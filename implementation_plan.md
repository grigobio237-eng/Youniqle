# Implementation Plan - Hero Scanner 속성 고도화

히어로 스캐너의 카메라 인식 범위를 식단 위주에서 **환경(Space)** 및 **상태(State)** 분석으로 확장하고, 회복 중심의 과학적 피드백을 강화합니다.

## User Review Required

- **안내 문구 수정**: 기존 "식단, 시술 부위..." 멘트에서 사용자님이 제안하신 "당신이 머무는 공간, 보는 것과 듣는 것..."의 톤으로 UI를 변경합니다.
- **AI 분석 로직**: 촬영 대상(음식, 공간, 상태)에 맞는 맞춤형 '회복의 과학적 근거'를 출력하도록 시스템 지시사항을 대폭 강화합니다.

## Proposed Changes

### 🛒 UI 및 안내 문구 업데이트
#### [MODIFY] [HeroScanner.tsx](file:///f:/youniqle/src/components/home/HeroScanner.tsx)
- 카메라 안내 멘트를 통합적 메시지로 수정합니다.
- 하단 카테고리 뱃지를 MEAL, AREA, MEDS에서 MEAL, SPACE, STATE로 변경합니다.

### 🧠 AI 분석 엔진 고도화
#### [MODIFY] [route.ts](file:///f:/youniqle/src/app/api/ai/food-analysis/route.ts)
- AI 시스템 프롬프트(Gemini)를 수정하여 이미지 내의 대상(음식, 공간, 신체 상태)을 자동 식별하고, 각 대상별 회복 지반 분석을 수행하도록 합니다.
- 응답 데이터 필드명을 범용적으로 수정합니다 (foodName -> subjectName 등).

## Verification Plan
- **브라우저 테스트**: 카메라 UI의 새로운 문구와 뱃지 노출 확인.
- **AI 분석 TEST**: 음식, 공간, 상태 사진 각각에 대한 회복 중심 피드백 확인.
