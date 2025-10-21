# Youniqle 모바일 앱 전환 플로우

## 📋 목차
1. [현재 프로젝트 분석](#1-현재-프로젝트-분석)
2. [모바일 앱 전환 옵션](#2-모바일-앱-전환-옵션)
3. [권장 접근 방식](#3-권장-접근-방식)
4. [옵션 A: PWA 전환 (단기)](#4-옵션-a-pwa-전환-단기)
5. [옵션 B: React Native 앱 개발 (중장기)](#5-옵션-b-react-native-앱-개발-중장기)
6. [API 재사용 전략](#6-api-재사용-전략)
7. [데이터베이스 및 백엔드](#7-데이터베이스-및-백엔드)
8. [일정 및 리소스 계획](#8-일정-및-리소스-계획)
9. [위험 요소 및 대응 방안](#9-위험-요소-및-대응-방안)

---

## 1. 현재 프로젝트 분석

### 📊 프로젝트 현황
- **프레임워크**: Next.js 15 + TypeScript
- **배포**: Vercel (https://www.grigobio.co.kr)
- **데이터베이스**: MongoDB Atlas
- **총 페이지**: 98개
- **API 엔드포인트**: 185개+
- **데이터 모델**: 34개
- **완성도**: 95%

### 🏗️ 주요 기능
```
핵심 기능:
├── 인증 시스템 (회원가입, 로그인, 소셜 로그인)
├── 쇼핑몰 (상품, 장바구니, 주문, 결제)
├── 파트너 시스템 (파트너 신청, 상품 관리)
├── 관리자 시스템 (대시보드, 분석, 관리)
├── 리뷰 & Q&A 시스템
├── 쿠폰 & 포인트 시스템
├── 정산 & 환불 시스템
├── 알림 시스템
└── AI 챗봇 (개발 중)
```

### 💻 기술 스택
```typescript
Frontend:
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js API Routes (서버리스)
- MongoDB + Mongoose
- NextAuth.js (인증)
- JWT 토큰

Integrations:
- Vercel Blob (이미지 저장)
- Nicepay (결제)
- Hiworks (이메일)
- Socket.IO (실시간 알림)
```

---

## 2. 모바일 앱 전환 옵션

### 옵션 비교표

| 구분 | PWA | React Native (Expo) | Flutter | Capacitor |
|------|-----|---------------------|---------|-----------|
| 개발 기간 | 1-2주 | 2-3개월 | 3-4개월 | 1-2개월 |
| 비용 | 매우 낮음 | 중간 | 중간-높음 | 낮음-중간 |
| 기존 코드 재사용 | 95% | 60-70% | 10-20% | 80-90% |
| 앱스토어 배포 | ✗ | ✓ | ✓ | ✓ |
| 네이티브 성능 | 보통 | 우수 | 우수 | 보통-우수 |
| 오프라인 지원 | 제한적 | 완전 | 완전 | 완전 |
| 푸시 알림 | 제한적 | 완전 | 완전 | 완전 |
| 카메라/센서 접근 | 제한적 | 완전 | 완전 | 완전 |
| 학습 곡선 | 낮음 | 중간 | 높음 | 낮음 |

---

## 3. 권장 접근 방식

### 🎯 2단계 전략 (권장)

#### Phase 1: PWA 전환 (즉시 실행)
- **목적**: 빠른 모바일 사용자 경험 개선
- **기간**: 1-2주
- **투자**: 최소
- **효과**: 모바일 웹 사용성 대폭 향상

#### Phase 2: React Native 앱 개발 (3-6개월 후)
- **목적**: 완전한 네이티브 앱 경험 제공
- **기간**: 2-3개월
- **투자**: 중간
- **효과**: 앱스토어 배포, 완전한 모바일 기능

### 💡 왜 2단계 전략인가?

1. **빠른 시장 진입**: PWA로 즉시 모바일 사용자 확보
2. **리스크 분산**: PWA로 먼저 검증 후 네이티브 앱 투자
3. **비용 효율**: 단계적 투자로 ROI 확인 가능
4. **기술 부채 최소화**: PWA 경험을 바탕으로 네이티브 앱 설계
5. **기존 자산 활용**: API는 그대로 사용, 프론트엔드만 점진적 전환

---

## 4. 옵션 A: PWA 전환 (단기)

### 🎯 목표
기존 Next.js 웹사이트를 PWA로 전환하여 모바일 앱처럼 사용 가능하게 만들기

### 📋 구현 단계

#### Step 1: PWA 설정 (1일)

**1.1 manifest.json 생성**
```json
// public/manifest.json
{
  "name": "Youniqle - 프리미엄 온라인 쇼핑몰",
  "short_name": "Youniqle",
  "description": "고품질 상품을 합리적인 가격으로",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#3B82F6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**1.2 Service Worker 구현**
```typescript
// public/service-worker.js
const CACHE_NAME = 'youniqle-v1';
const urlsToCache = [
  '/',
  '/products',
  '/cart',
  '/me',
  '/offline.html'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch 이벤트 (네트워크 우선 전략)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => response || caches.match('/offline.html'));
      })
  );
});
```

**1.3 next.config.js 업데이트**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.grigobio\.co\.kr\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30일
        }
      }
    }
  ]
});

module.exports = withPWA({
  // 기존 next.config.js 설정
});
```

**1.4 layout.tsx에 메타데이터 추가**
```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  // 기존 메타데이터...
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Youniqle'
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Youniqle" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

#### Step 2: 모바일 UI/UX 최적화 (2-3일)

**2.1 터치 인터랙션 개선**
```typescript
// src/components/ui/TouchOptimized.tsx
'use client';

import { useState } from 'react';

export function TouchOptimizedButton({ children, onClick, ...props }: any) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={onClick}
      className={`
        min-h-[44px] min-w-[44px] // Apple 권장 터치 영역
        active:scale-95 transition-transform
        ${isPressed ? 'bg-gray-100' : ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
```

**2.2 모바일 네비게이션 개선**
```typescript
// src/components/layout/MobileNavigation.tsx
'use client';

import { Home, ShoppingBag, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/products', icon: ShoppingBag, label: '상품' },
    { href: '/cart', icon: ShoppingCart, label: '장바구니' },
    { href: '/me', icon: User, label: '마이' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full space-y-1
                ${isActive ? 'text-blue-600' : 'text-gray-600'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**2.3 Safe Area 처리 (노치 디바이스)**
```css
/* src/app/globals.css */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
  }
  
  .pt-safe {
    padding-top: calc(env(safe-area-inset-top) + 0.5rem);
  }
}
```

**2.4 Pull-to-Refresh 구현**
```typescript
// src/hooks/usePullToRefresh.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function usePullToRefresh() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, 100));
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 80) {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } else {
        setPullDistance(0);
      }
      setStartY(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, router]);

  return { isRefreshing, pullDistance };
}
```

#### Step 3: 오프라인 지원 (1-2일)

**3.1 오프라인 페이지 생성**
```typescript
// src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <svg className="w-24 h-24 mx-auto text-gray-400" /* 오프라인 아이콘 */ />
        <h1 className="text-2xl font-bold">인터넷 연결 없음</h1>
        <p className="text-gray-600">
          인터넷 연결을 확인하고 다시 시도해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
```

**3.2 네트워크 상태 감지**
```typescript
// src/hooks/useNetworkStatus.ts
'use client';

import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

#### Step 4: 푸시 알림 (2-3일)

**4.1 Web Push API 구현**
```typescript
// src/lib/pushNotifications.ts
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    // 서버에 구독 정보 전송
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}
```

**4.2 Service Worker에 푸시 이벤트 처리 추가**
```javascript
// public/service-worker.js에 추가
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

#### Step 5: 앱 설치 프롬프트 (1일)

**5.1 설치 배너 컴포넌트**
```typescript
// src/components/InstallPrompt.tsx
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 설치 프롬프트를 이미 거부했는지 확인
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-center space-x-4">
        <img src="/icons/icon-72x72.png" alt="Youniqle" className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <h3 className="font-semibold">앱으로 설치하기</h3>
          <p className="text-sm text-gray-600">
            홈 화면에 추가하여 빠르게 접속하세요
          </p>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg font-medium"
      >
        설치하기
      </button>
    </div>
  );
}
```

#### Step 6: 테스트 및 배포 (2-3일)

**6.1 테스트 체크리스트**
- [ ] PWA Manifest 검증 (Chrome DevTools > Application)
- [ ] Service Worker 작동 확인
- [ ] 오프라인 기능 테스트
- [ ] 설치 프롬프트 동작 확인
- [ ] iOS Safari 테스트 (Add to Home Screen)
- [ ] Android Chrome 테스트
- [ ] 푸시 알림 테스트
- [ ] Lighthouse PWA 점수 확인 (90점 이상 목표)

**6.2 배포 단계**
```bash
# 1. next-pwa 설치
npm install next-pwa

# 2. 아이콘 생성 (온라인 도구 사용)
# https://www.pwabuilder.com/imageGenerator

# 3. 빌드 및 배포
npm run build
git add .
git commit -m "Add PWA support"
git push origin main
```

### 📊 PWA 예상 효과

| 지표 | 개선 예상치 |
|------|------------|
| 모바일 사용성 | 50-70% 향상 |
| 페이지 로딩 속도 | 30-50% 개선 |
| 재방문율 | 20-30% 증가 |
| 이탈률 | 15-25% 감소 |
| 앱 설치율 | 5-10% (iOS), 15-25% (Android) |

---

## 5. 옵션 B: React Native 앱 개발 (중장기)

### 🎯 목표
완전한 네이티브 앱 경험을 제공하는 iOS/Android 앱 개발

### 📋 프로젝트 설정

#### Step 1: Expo 프로젝트 초기화 (1일)

```bash
# Expo CLI 설치
npm install -g expo-cli

# 새 프로젝트 생성
npx create-expo-app youniqle-mobile --template

# 프로젝트 구조
cd youniqle-mobile
```

**프로젝트 구조**
```
youniqle-mobile/
├── app/                      # Expo Router (파일 기반 라우팅)
│   ├── (tabs)/              # 탭 네비게이션
│   │   ├── index.tsx        # 홈
│   │   ├── products.tsx     # 상품 목록
│   │   ├── cart.tsx         # 장바구니
│   │   └── profile.tsx      # 프로필
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── products/
│   │   └── [id].tsx         # 상품 상세
│   └── _layout.tsx          # 루트 레이아웃
├── components/              # 재사용 컴포넌트
├── services/               # API 서비스
├── store/                  # 상태 관리 (Zustand)
├── constants/              # 상수
├── types/                  # TypeScript 타입
└── app.json               # 앱 설정
```

#### Step 2: 필수 라이브러리 설치 (1일)

```bash
# 네비게이션
npx expo install expo-router react-native-safe-area-context react-native-screens

# UI 라이브러리
npm install @rneui/themed @rneui/base
npm install react-native-elements

# 상태 관리
npm install zustand

# API 통신
npm install axios react-query

# 인증
npm install @react-native-async-storage/async-storage
npm install expo-secure-store

# 이미지
npx expo install expo-image expo-image-picker

# 결제
npm install react-native-iamport

# 소셜 로그인
npx expo install expo-auth-session expo-web-browser
npx expo install expo-google-app-auth
npx expo install expo-facebook

# 기타
npx expo install expo-notifications
npx expo install expo-location
npx expo install expo-camera
```

#### Step 3: API 서비스 레이어 구현 (3-5일)

**3.1 API 클라이언트 설정**
```typescript
// services/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://www.grigobio.co.kr/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (JWT 토큰 추가)
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 처리
      await SecureStore.deleteItemAsync('authToken');
      // 로그인 화면으로 리디렉트
    }
    return Promise.reject(error);
  }
);
```

**3.2 인증 API**
```typescript
// services/api/auth.ts
import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const authAPI = {
  // 로그인
  login: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    if (data.token) {
      await SecureStore.setItemAsync('authToken', data.token);
    }
    return data;
  },

  // 회원가입
  signup: async (signupData: SignupData) => {
    const { data } = await apiClient.post('/auth/signup', signupData);
    return data;
  },

  // 로그아웃
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    await apiClient.post('/auth/logout');
  },

  // 현재 사용자 정보
  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
```

**3.3 상품 API**
```typescript
// services/api/products.ts
import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: Array<{ url: string }>;
  stock: number;
  category: string;
  description: string;
}

export const productsAPI = {
  // 상품 목록
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  // 상품 상세
  getProduct: async (id: string) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  // 추천 상품
  getRecommendations: async (productId: string) => {
    const { data } = await apiClient.get(`/products/${productId}/recommend`);
    return data;
  },
};
```

**3.4 장바구니 API**
```typescript
// services/api/cart.ts
import { apiClient } from './client';

export const cartAPI = {
  // 장바구니 조회
  getCart: async () => {
    const { data } = await apiClient.get('/cart');
    return data;
  },

  // 상품 추가
  addToCart: async (productId: string, quantity: number) => {
    const { data } = await apiClient.post('/cart', { productId, quantity });
    return data;
  },

  // 수량 업데이트
  updateCartItem: async (productId: string, quantity: number) => {
    const { data } = await apiClient.put('/cart/update', { productId, quantity });
    return data;
  },

  // 상품 제거
  removeFromCart: async (productId: string) => {
    const { data } = await apiClient.delete('/cart', { data: { productId } });
    return data;
  },
};
```

#### Step 4: 상태 관리 설정 (2-3일)

**4.1 인증 스토어**
```typescript
// store/authStore.ts
import { create } from 'zustand';
import { authAPI } from '../services/api/auth';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  signup: async (data) => {
    try {
      await authAPI.signup(data);
      // 자동 로그인 또는 로그인 페이지로 이동
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const user = await authAPI.me();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

**4.2 장바구니 스토어**
```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { cartAPI } from '../services/api/cart';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartAPI.getCart();
      set({
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addItem: async (productId, quantity) => {
    try {
      await cartAPI.addToCart(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      throw error;
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      await cartAPI.updateCartItem(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      throw error;
    }
  },

  removeItem: async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await get().fetchCart();
    } catch (error) {
      throw error;
    }
  },
}));
```

#### Step 5: 주요 화면 구현 (3-4주)

**5.1 홈 화면**
```typescript
// app/(tabs)/index.tsx
import { View, ScrollView, Text } from 'react-native';
import { useQuery } from 'react-query';
import { productsAPI } from '../../services/api/products';
import { ProductCard } from '../../components/ProductCard';

export default function HomeScreen() {
  const { data: products, isLoading } = useQuery(
    'featured-products',
    () => productsAPI.getProducts({ featured: true, limit: 10 })
  );

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero 섹션 */}
      <View className="h-64 bg-blue-600 p-6 justify-center">
        <Text className="text-3xl font-bold text-white">Youniqle</Text>
        <Text className="text-lg text-white mt-2">
          프리미엄을 더 공정하게
        </Text>
      </View>

      {/* 추천 상품 */}
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">추천 상품</Text>
        {isLoading ? (
          <Text>로딩 중...</Text>
        ) : (
          <View className="flex-row flex-wrap">
            {products?.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
```

**5.2 상품 상세 화면**
```typescript
// app/products/[id].tsx
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from 'react-query';
import { productsAPI } from '../../services/api/products';
import { useCartStore } from '../../store/cartStore';
import { Button } from '@rneui/themed';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => productsAPI.getProduct(id as string)
  );

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, 1);
      // 성공 메시지 표시
    } catch (error) {
      // 에러 메시지 표시
    }
  };

  if (isLoading) return <Text>로딩 중...</Text>;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* 상품 이미지 */}
      <Image
        source={{ uri: product.images[0]?.url }}
        className="w-full h-96"
        resizeMode="cover"
      />

      {/* 상품 정보 */}
      <View className="p-4">
        <Text className="text-2xl font-bold">{product.name}</Text>
        
        <View className="flex-row items-center mt-2">
          {product.originalPrice && (
            <Text className="text-gray-400 line-through mr-2">
              {product.originalPrice.toLocaleString()}원
            </Text>
          )}
          <Text className="text-2xl font-bold text-blue-600">
            {product.price.toLocaleString()}원
          </Text>
        </View>

        <Text className="text-gray-600 mt-4">{product.description}</Text>
      </View>

      {/* 하단 고정 버튼 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          title="장바구니 담기"
          onPress={handleAddToCart}
          buttonStyle={{ backgroundColor: '#3B82F6' }}
        />
      </View>
    </ScrollView>
  );
}
```

**5.3 장바구니 화면**
```typescript
// app/(tabs)/cart.tsx
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalAmount, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-lg text-gray-600">
              장바구니가 비어있습니다
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.productId} className="border-b border-gray-200 p-4">
              <View className="flex-row">
                <Image
                  source={{ uri: item.product.images[0]?.url }}
                  className="w-20 h-20 rounded"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-semibold">{item.product.name}</Text>
                  <Text className="text-blue-600 mt-1">
                    {item.price.toLocaleString()}원
                  </Text>
                  
                  <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                      onPress={() => updateItem(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text className="mx-4">{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateItem(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeItem(item.productId)}
                      className="ml-auto"
                    >
                      <Text className="text-red-600">삭제</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 하단 결제 버튼 */}
      {items.length > 0 && (
        <View className="border-t border-gray-200 p-4">
          <View className="flex-row justify-between mb-4">
            <Text className="text-lg font-semibold">총 금액</Text>
            <Text className="text-2xl font-bold text-blue-600">
              {totalAmount.toLocaleString()}원
            </Text>
          </View>
          <Button
            title="결제하기"
            onPress={handleCheckout}
            buttonStyle={{ backgroundColor: '#3B82F6', height: 50 }}
          />
        </View>
      )}
    </View>
  );
}
```

#### Step 6: 네이티브 기능 통합 (1-2주)

**6.1 카메라 & 이미지 업로드**
```typescript
// components/ImageUpload.tsx
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';

export function ImageUpload({ onUpload }: { onUpload: (uri: string) => void }) {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('사진 접근 권한이 필요합니다');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      onUpload(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('카메라 접근 권한이 필요합니다');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      onUpload(result.assets[0].uri);
    }
  };

  return (
    <View>
      {image && (
        <Image source={{ uri: image }} className="w-full h-64 rounded" />
      )}
      <View className="flex-row space-x-2 mt-4">
        <TouchableOpacity onPress={pickImage} className="flex-1 bg-blue-600 p-4 rounded">
          <Text className="text-white text-center">갤러리에서 선택</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} className="flex-1 bg-green-600 p-4 rounded">
          <Text className="text-white text-center">사진 촬영</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

**6.2 푸시 알림**
```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('푸시 알림 권한이 필요합니다');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export function setupNotificationListeners() {
  // 알림 클릭 시 처리
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    // 딥 링크 처리
    if (data.url) {
      // router.push(data.url);
    }
  });

  // 알림 수신 시 처리 (포그라운드)
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });
}
```

**6.3 위치 기반 서비스**
```typescript
// services/location.ts
import * as Location from 'expo-location';

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('위치 권한이 필요합니다');
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function getAddressFromCoords(latitude: number, longitude: number) {
  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  
  if (results.length > 0) {
    const address = results[0];
    return `${address.city} ${address.street} ${address.name}`;
  }
  
  return null;
}
```

#### Step 7: 앱 설정 및 빌드 (3-5일)

**7.1 app.json 설정**
```json
{
  "expo": {
    "name": "Youniqle",
    "slug": "youniqle",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.sapienet.youniqle",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSCameraUsageDescription": "상품 리뷰 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다.",
        "NSPhotoLibraryUsageDescription": "상품 이미지를 업로드하기 위해 사진 접근 권한이 필요합니다.",
        "NSLocationWhenInUseUsageDescription": "주변 매장을 찾기 위해 위치 권한이 필요합니다."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "com.sapienet.youniqle",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3B82F6"
        }
      ],
      "expo-router"
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

**7.2 EAS Build 설정**
```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

**7.3 빌드 및 배포 명령어**
```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# 프로젝트 설정
eas build:configure

# 개발 빌드
eas build --profile development --platform ios
eas build --profile development --platform android

# 프로덕션 빌드
eas build --profile production --platform all

# 앱스토어 제출
eas submit --platform ios
eas submit --platform android
```

### 📊 React Native 앱 예상 효과

| 지표 | 개선 예상치 |
|------|------------|
| 앱 성능 | 웹 대비 2-3배 빠름 |
| 사용자 참여도 | 40-60% 증가 |
| 재구매율 | 30-50% 증가 |
| 앱 설치율 | iOS 15-25%, Android 25-40% |
| 푸시 알림 전환율 | 5-10% |
| 오프라인 사용률 | 15-20% |

---

## 6. API 재사용 전략

### ✅ 기존 API 100% 재사용 가능

현재 Next.js API Routes는 RESTful API로 설계되어 있어 **모바일 앱에서 그대로 사용 가능**합니다.

#### API 엔드포인트 현황 (185개+)

```
인증 API (7개)
├── POST /api/auth/signup
├── POST /api/auth/login
├── POST /api/auth/logout
├── GET  /api/auth/me
├── POST /api/auth/verify-email
├── POST /api/auth/[...nextauth]
└── GET  /api/auth/signout

상품 API (12개+)
├── GET  /api/products
├── GET  /api/products/[id]
├── POST /api/products
├── PUT  /api/products/[id]
├── DELETE /api/products/[id]
└── GET  /api/products/recommend

장바구니 API (4개)
├── GET  /api/cart
├── POST /api/cart
├── PUT  /api/cart/update
└── DELETE /api/cart

주문 API (8개+)
├── GET  /api/orders
├── POST /api/orders
├── GET  /api/orders/[id]
├── POST /api/orders/[id]/cancel
└── POST /api/orders/[id]/confirm-payment

결제 API (3개)
├── POST /api/payment/request
├── POST /api/payment/result
└── POST /api/payment/cancel

파트너 API (15개+)
└── (파트너 관련 모든 기능)

관리자 API (120개+)
└── (관리자 관련 모든 기능)
```

### 🔧 API 최적화 권장사항

#### 1. 응답 페이로드 최적화
```typescript
// 모바일용 경량화 옵션 추가
GET /api/products?mobile=true  // 이미지 크기 축소, 불필요한 필드 제외
```

#### 2. 페이지네이션 개선
```typescript
// Cursor 기반 페이지네이션 (무한 스크롤)
GET /api/products?cursor=last_id&limit=20
```

#### 3. GraphQL 고려 (선택사항)
```typescript
// 필요한 데이터만 요청 가능
POST /api/graphql
{
  products {
    id
    name
    price
    images(size: "mobile")
  }
}
```

---

## 7. 데이터베이스 및 백엔드

### ✅ 현재 백엔드 그대로 사용

- **MongoDB Atlas**: 변경 없이 계속 사용
- **Next.js API Routes**: 서버리스 함수로 계속 작동
- **Vercel 배포**: 웹사이트와 API 모두 유지

### 🔄 필요한 변경사항

#### 1. CORS 설정 업데이트
```typescript
// next.config.js에 모바일 앱 허용 추가
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*', // 또는 특정 앱 도메인만 허용
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
      ],
    },
  ];
}
```

#### 2. Rate Limiting 조정
```typescript
// 모바일 앱은 더 높은 rate limit 허용
const getRateLimit = (userAgent: string) => {
  if (userAgent.includes('Youniqle-Mobile')) {
    return 1000; // 모바일 앱: 1000 requests/hour
  }
  return 100; // 웹: 100 requests/hour
};
```

---

## 8. 일정 및 리소스 계획

### Phase 1: PWA 전환 (1-2주)

| 주차 | 작업 내용 | 담당자 | 산출물 |
|------|----------|--------|--------|
| 1주 | PWA 설정, Service Worker, Manifest | Frontend Dev | PWA 기본 구조 |
| 1주 | 모바일 UI/UX 최적화 | Frontend Dev + Designer | 반응형 UI |
| 2주 | 오프라인 지원, 푸시 알림 | Frontend Dev | 완전한 PWA |
| 2주 | 테스트 및 배포 | QA + DevOps | 프로덕션 배포 |

**필요 인력**:
- Frontend 개발자 1명 (풀타임)
- UI/UX 디자이너 0.5명 (파트타임)
- QA 엔지니어 0.5명 (파트타임)

**예상 비용**: 300만원 - 500만원

---

### Phase 2: React Native 앱 개발 (2-3개월)

| 월 | 작업 내용 | 담당자 | 산출물 |
|----|----------|--------|--------|
| 1개월 | 프로젝트 설정, API 통합, 인증 시스템 | RN Dev | 기본 구조 |
| 1개월 | 주요 화면 구현 (홈, 상품, 장바구니, 주문) | RN Dev + Designer | 핵심 기능 |
| 2개월 | 네이티브 기능 (카메라, 푸시, 위치) | RN Dev | 고급 기능 |
| 2개월 | 결제 연동, 테스트 | RN Dev + QA | 완전한 앱 |
| 3개월 | 앱스토어 심사 및 배포 | DevOps + PM | 앱 출시 |

**필요 인력**:
- React Native 개발자 1-2명 (풀타임)
- UI/UX 디자이너 1명 (풀타임)
- QA 엔지니어 1명 (파트타임)
- DevOps 엔지니어 0.5명 (파트타임)

**예상 비용**: 3000만원 - 5000만원

---

## 9. 위험 요소 및 대응 방안

### ⚠️ 주요 위험 요소

#### 1. PWA 브라우저 호환성
- **위험**: iOS Safari의 PWA 기능 제한
- **대응**: iOS용 네이티브 앱 우선 개발 고려

#### 2. 결제 시스템 통합
- **위험**: 모바일 결제 SDK 통합 복잡도
- **대응**: Nicepay 모바일 SDK 사전 검증

#### 3. 푸시 알림 도달률
- **위험**: iOS/Android 푸시 알림 제약
- **대응**: Firebase Cloud Messaging 사용

#### 4. 앱스토어 심사 지연
- **위험**: Apple/Google 심사 거부 또는 지연
- **대응**: 사전에 가이드라인 준수, 테스트플라이트 활용

#### 5. 성능 이슈
- **위험**: 대용량 이미지, 네트워크 지연
- **대응**: 이미지 최적화, 로컬 캐싱 전략

---

## 10. 단계별 체크리스트

### ✅ PWA 전환 체크리스트

- [ ] **Phase 1: 기본 설정**
  - [ ] manifest.json 생성
  - [ ] Service Worker 구현
  - [ ] next-pwa 설치 및 설정
  - [ ] PWA 아이콘 생성 (8개 크기)

- [ ] **Phase 2: UI/UX 최적화**
  - [ ] 모바일 네비게이션 구현
  - [ ] 터치 인터랙션 개선
  - [ ] Safe Area 처리
  - [ ] Pull-to-Refresh 구현

- [ ] **Phase 3: 오프라인 지원**
  - [ ] 캐싱 전략 구현
  - [ ] 오프라인 페이지 생성
  - [ ] 네트워크 상태 감지

- [ ] **Phase 4: 푸시 알림**
  - [ ] Web Push API 구현
  - [ ] Service Worker 푸시 이벤트 처리
  - [ ] 알림 권한 요청 UI

- [ ] **Phase 5: 설치 프롬프트**
  - [ ] 설치 배너 구현
  - [ ] beforeinstallprompt 이벤트 처리
  - [ ] iOS Add to Home Screen 안내

- [ ] **Phase 6: 테스트 및 배포**
  - [ ] Lighthouse PWA 점수 90+ 달성
  - [ ] 주요 브라우저 테스트 (Chrome, Safari, Firefox)
  - [ ] 프로덕션 배포

---

### ✅ React Native 앱 체크리스트

- [ ] **Phase 1: 프로젝트 설정**
  - [ ] Expo 프로젝트 초기화
  - [ ] 필수 라이브러리 설치
  - [ ] 프로젝트 구조 설정
  - [ ] TypeScript 설정

- [ ] **Phase 2: API 통합**
  - [ ] API 클라이언트 설정
  - [ ] 인증 API 통합
  - [ ] 상품 API 통합
  - [ ] 장바구니 API 통합
  - [ ] 주문 API 통합

- [ ] **Phase 3: 상태 관리**
  - [ ] Zustand 스토어 설정
  - [ ] 인증 스토어 구현
  - [ ] 장바구니 스토어 구현
  - [ ] 상품 스토어 구현

- [ ] **Phase 4: 주요 화면 구현**
  - [ ] 홈 화면
  - [ ] 상품 목록 화면
  - [ ] 상품 상세 화면
  - [ ] 장바구니 화면
  - [ ] 주문 화면
  - [ ] 마이페이지
  - [ ] 로그인/회원가입 화면

- [ ] **Phase 5: 네이티브 기능**
  - [ ] 카메라 & 이미지 업로드
  - [ ] 푸시 알림
  - [ ] 위치 기반 서비스
  - [ ] 생체 인증 (Face ID, Touch ID)
  - [ ] 딥 링크

- [ ] **Phase 6: 결제 통합**
  - [ ] Nicepay 모바일 SDK 통합
  - [ ] 결제 플로우 구현
  - [ ] 결제 결과 처리

- [ ] **Phase 7: 테스트**
  - [ ] 단위 테스트
  - [ ] 통합 테스트
  - [ ] E2E 테스트
  - [ ] 실제 디바이스 테스트

- [ ] **Phase 8: 앱 설정 및 빌드**
  - [ ] app.json 설정
  - [ ] EAS Build 설정
  - [ ] 스플래시 스크린 & 아이콘
  - [ ] 개발 빌드 생성

- [ ] **Phase 9: 앱스토어 제출**
  - [ ] Apple Developer 계정 준비
  - [ ] Google Play Console 계정 준비
  - [ ] 프로덕션 빌드 생성
  - [ ] 앱스토어 메타데이터 작성
  - [ ] 스크린샷 준비
  - [ ] iOS 심사 제출
  - [ ] Android 심사 제출

---

## 11. 결론 및 권장사항

### 🎯 최종 권장 전략

#### **단기 (즉시 실행)**: PWA 전환
- **기간**: 1-2주
- **비용**: 300만원 - 500만원
- **효과**: 모바일 사용성 50-70% 향상
- **리스크**: 낮음

✅ **즉시 시작 권장**

#### **중장기 (3-6개월 후)**: React Native 앱
- **기간**: 2-3개월
- **비용**: 3000만원 - 5000만원
- **효과**: 완전한 네이티브 앱 경험
- **리스크**: 중간

⏳ **PWA 성과 검증 후 진행**

### 💡 핵심 포인트

1. **기존 API 재사용**: 백엔드 변경 최소화
2. **점진적 전환**: PWA → React Native 단계적 접근
3. **비용 효율**: 단계별 투자로 ROI 검증
4. **리스크 최소화**: 검증된 기술 스택 사용
5. **사용자 중심**: 모바일 UX 최우선

---

**작성일**: 2025년 10월 20일  
**작성자**: AI Development Team  
**문서 버전**: 1.0.0  
**다음 업데이트**: PWA 구현 완료 후



