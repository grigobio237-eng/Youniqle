# 다음 개발 세션 시작 프롬프트

## 🎯 마케팅 & 알림 시스템 구현 세션

```
안녕하세요! Youniqle 프로젝트의 마케팅 시스템과 알림 시스템 구현을 시작하겠습니다.

## 📊 현재 프로젝트 상태 요약

### ✅ 완료된 작업들
- 기본 이커머스 기능 완료 (상품 관리, 장바구니, 주문 처리)
- 사용자 인증 시스템 구현 완료
- 데이터베이스 연결 안정화 완료 (MongoDB 최적화)
- 빌드 및 배포 최적화 완료 (Vercel 서버리스 환경)
- React Hook 경고 및 TypeScript 에러 해결 완료
- 이미지 최적화 및 성능 개선 완료

### 🎯 이번 세션 목표
**마케팅 시스템과 알림 시스템을 중심으로 Youniqle을 완성도 높은 이커머스 플랫폼으로 발전**

## 🚀 구현할 주요 기능들

### 1. 이메일 마케팅 시스템 (High Priority)
- 이메일 캠페인 관리자
- 구독자 목록 및 세그먼트 관리
- 이메일 템플릿 에디터
- 캠페인 스케줄링 및 자동화
- 이메일 전송 통계 및 분석
- 구독 해지 관리

### 2. 푸시 알림 시스템 (High Priority)
- 실시간 푸시 알림 전송
- 사용자 세그먼트별 타겟팅
- 알림 템플릿 관리
- 알림 성과 분석
- 알림 설정 사용자 커스터마이징

### 3. SMS 알림 시스템 (Medium Priority)
- SMS 템플릿 관리
- 주문/배송 알림 자동화
- 프로모션 SMS 캠페인
- SMS 전송 로그 및 분석

### 4. 소셜 미디어 연동 (Medium Priority)
- 소셜 미디어 계정 연결
- 자동 포스팅 시스템
- 크로스 플랫폼 마케팅
- 소셜 미디어 분석

### 5. 알림 설정 관리 (High Priority)
- 사용자별 알림 설정
- 알림 우선순위 관리
- 알림 히스토리 관리
- 실시간 알림 대시보드

## 🛠️ 기술 스택

### 마케팅 도구
- **이메일**: SendGrid 또는 Nodemailer
- **푸시 알림**: Firebase Cloud Messaging (FCM)
- **SMS**: Twilio 또는 AWS SNS
- **소셜 미디어**: 각 플랫폼 API

### 기존 기술 스택 활용
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **실시간 통신**: Socket.IO (이미 설정됨)
- **인증**: NextAuth.js
- **배포**: Vercel

## 📁 주요 구현 파일들

### 새로 생성할 파일들
```
src/
├── components/marketing/
│   ├── EmailCampaignManager.tsx
│   ├── PushNotificationManager.tsx
│   ├── SocialMediaManager.tsx
│   └── MarketingAnalytics.tsx
├── app/api/marketing/
│   ├── email/route.ts
│   ├── push/route.ts
│   └── analytics/route.ts
└── lib/marketing/
    ├── emailService.ts
    ├── pushService.ts
    └── socialService.ts
```

### 기존 파일 확장
- `src/app/admin/marketing/page.tsx` - 마케팅 대시보드 확장
- `src/app/admin/notifications/page.tsx` - 알림 관리 확장
- `src/hooks/useRealtimeNotifications.ts` - 실시간 알림 기능 확장

## 🎯 구현 순서

1. **이메일 마케팅 시스템** (가장 우선)
   - 이메일 템플릿 관리자
   - 캠페인 생성 및 전송
   - 구독자 관리

2. **푸시 알림 시스템**
   - FCM 설정 및 연동
   - 실시간 알림 전송
   - 알림 설정 관리

3. **SMS 알림 시스템**
   - SMS 템플릿 관리
   - 자동 알림 전송

4. **소셜 미디어 연동**
   - 계정 연결
   - 자동 포스팅

5. **통합 대시보드**
   - 마케팅 성과 분석
   - 알림 통계 관리

## 🔧 시작 전 확인사항

1. **프로젝트 상태 확인**
   ```bash
   cd F:\youniqle
   git status
   npm run dev
   ```

2. **환경변수 확인**
   - `.env.local` 파일의 MongoDB, 인증 관련 설정
   - 마케팅 서비스 API 키 설정 준비

3. **기존 기능 테스트**
   - 로그인/회원가입 기능
   - 상품 페이지 로딩
   - 관리자 대시보드 접근

## 📊 성공 지표

- 이메일 캠페인 전송 성공률 95%+
- 푸시 알림 전송 지연시간 <1초
- SMS 알림 전송 성공률 95%+
- 사용자 알림 설정 관리 완성
- 마케팅 ROI 분석 기능 완성

먼저 현재 프로젝트 상태를 확인하고, 이메일 마케팅 시스템부터 구현을 시작하겠습니다. 

어떤 부분부터 시작하고 싶으신가요?
```

## 🔄 대안 프롬프트 (간단 버전)

```
Youniqle 프로젝트 마케팅 & 알림 시스템 구현을 시작합니다.

현재 상태: 기본 이커머스 기능 완료, DB 연결 안정화 완료
목표: 이메일 마케팅, 푸시 알림, SMS 알림, 소셜 미디어 연동 구현

우선순위:
1. 이메일 마케팅 시스템 (캠페인 관리, 템플릿, 구독자 관리)
2. 푸시 알림 시스템 (실시간 알림, 타겟팅)
3. SMS 알림 시스템 (주문/배송 알림)
4. 소셜 미디어 연동 (자동 포스팅)

기술 스택: SendGrid, FCM, Twilio, 기존 Next.js/MongoDB 스택 활용

이메일 마케팅 시스템부터 구현을 시작하겠습니다.
```

## 📋 체크리스트

### 시작 전 확인
- [ ] 프로젝트 디렉토리 접근 가능
- [ ] Git 상태 정상
- [ ] 로컬 서버 실행 가능
- [ ] 환경변수 설정 완료
- [ ] 기존 기능 테스트 완료

### 구현 완료 후 확인
- [ ] 이메일 캠페인 생성/전송 테스트
- [ ] 푸시 알림 전송 테스트
- [ ] SMS 알림 전송 테스트
- [ ] 관리자 대시보드 정상 작동
- [ ] 사용자 알림 설정 정상 작동
- [ ] Vercel 배포 테스트

---

**이 프롬프트를 사용하여 다음 세션을 시작하세요!**
