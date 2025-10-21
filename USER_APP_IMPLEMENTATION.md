# Youniqle 유저용 앱 구현 가이드

## 📱 앱 개요

```yaml
앱명: Youniqle
슬로건: 프리미엄을 더 공정하게
패키지명:
  iOS: com.sapienet.youniqle
  Android: com.sapienet.youniqle
대상: 일반 고객 (B2C)
플랫폼: iOS 14+, Android 8.0+
배포: App Store, Google Play Store
```

---

## 📋 목차
1. [Phase 1: PWA 구현 (2주)](#phase-1-pwa-구현-2주)
2. [Phase 2: React Native 앱 구현 (2개월)](#phase-2-react-native-앱-구현-2개월)
3. [화면별 상세 설계](#화면별-상세-설계)
4. [API 통합 가이드](#api-통합-가이드)
5. [테스트 시나리오](#테스트-시나리오)

---

## Phase 1: PWA 구현 (2주)

### 🎯 목표
- 기존 웹사이트를 PWA로 전환
- 모바일 사용성 50-70% 향상
- 앱 설치 가능

### 📅 Week 1: PWA 기본 설정

#### Day 1-2: 환경 설정
```bash
# 1. next-pwa 설치
npm install next-pwa

# 2. 아이콘 생성
# https://www.pwabuilder.com/imageGenerator
# 512x512 로고 업로드 → 모든 크기 다운로드
```

**생성할 아이콘 크기**:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

#### Day 3: manifest.json 생성

`public/manifest.json`:
```json
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
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["shopping"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1080x1920",
      "type": "image/png"
    }
  ]
}
```

#### Day 4-5: next.config.js 수정

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // ... 기존 설정
};

module.exports = withPWA(nextConfig);
```

### 📅 Week 2: 모바일 UI/UX 최적화

#### Day 1-2: 모바일 네비게이션 구현

`src/components/layout/MobileBottomNav.tsx`:
```typescript
'use client';

import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/products', icon: ShoppingBag, label: '상품' },
    { href: '/cart', icon: ShoppingCart, label: '장바구니' },
    { href: '/me', icon: User, label: '마이' },
  ];

  // 관리자/파트너 페이지에서는 숨김
  if (pathname.startsWith('/admin') || pathname.startsWith('/partner')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full space-y-1 transition-colors
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

#### Day 3: Pull-to-Refresh 구현

`src/hooks/usePullToRefresh.ts`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function usePullToRefresh() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        setStartY(touchStartY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0 || window.scrollY > 0) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0) {
        e.preventDefault();
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
          setStartY(0);
        }, 1000);
      } else {
        setPullDistance(0);
        setStartY(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
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

#### Day 4-5: 설치 프롬프트 & 테스트

`src/components/InstallPrompt.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem('pwaInstallDismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50">
      <button onClick={handleDismiss} className="absolute top-2 right-2">
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-center space-x-4">
        <img src="/icons/icon-72x72.png" alt="Youniqle" className="w-12 h-12" />
        <div className="flex-1">
          <h3 className="font-semibold">앱으로 설치하기</h3>
          <p className="text-sm text-gray-600">빠르게 접속하세요</p>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg"
      >
        <Download className="inline w-4 h-4 mr-2" />
        설치하기
      </button>
    </div>
  );
}
```

---

## Phase 2: React Native 앱 구현 (2개월)

### 🎯 목표
- 완전한 네이티브 앱 경험
- iOS/Android 앱스토어 배포
- 네이티브 기능 활용 (카메라, 푸시 알림)

### 📅 Week 1-2: 프로젝트 설정 & 인증

#### Day 1: Expo 프로젝트 초기화

```bash
# Expo 프로젝트 생성
npx create-expo-app youniqle-app --template

cd youniqle-app

# 필수 패키지 설치
npx expo install expo-router react-native-safe-area-context react-native-screens
npm install zustand axios react-query
npm install @rneui/themed @rneui/base
npx expo install expo-secure-store
npx expo install expo-image
```

#### Day 2-3: 프로젝트 구조 설정

```
youniqle-app/
├── app/
│   ├── (tabs)/              # 탭 네비게이션
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # 홈
│   │   ├── categories.tsx  # 카테고리
│   │   ├── cart.tsx        # 장바구니
│   │   └── profile.tsx     # 프로필
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── products/
│   │   └── [id].tsx
│   └── _layout.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   └── LoadingSpinner.tsx
│   └── product/
│       └── ProductCard.tsx
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── products.ts
│   └── storage.ts
├── store/
│   ├── authStore.ts
│   └── cartStore.ts
├── constants/
│   └── config.ts
└── app.json
```

#### Day 4-5: API 클라이언트 설정

`services/api/client.ts`:
```typescript
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

// 요청 인터셉터
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

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      // 로그인 페이지로 리디렉트
    }
    return Promise.reject(error);
  }
);
```

`services/api/auth.ts`:
```typescript
import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    if (data.token) {
      await SecureStore.setItemAsync('authToken', data.token);
    }
    return data;
  },

  signup: async (userData: any) => {
    const { data } = await apiClient.post('/auth/signup', userData);
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    await apiClient.post('/auth/logout');
  },
};
```

#### Day 6-7: 인증 화면 구현

`app/auth/login.tsx`:
```typescript
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      alert('로그인 실패: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold mb-8">로그인</Text>
      
      <TextInput
        className="border border-gray-300 rounded-lg p-4 mb-4"
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        className="border border-gray-300 rounded-lg p-4 mb-6"
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        className="bg-blue-600 rounded-lg p-4 mb-4"
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? '로그인 중...' : '로그인'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/auth/signup')}>
        <Text className="text-blue-600 text-center">
          계정이 없으신가요? 회원가입
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 📅 Week 3-4: 홈 & 상품 목록

#### 홈 화면 구현

`app/(tabs)/index.tsx`:
```typescript
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { useQuery } from 'react-query';
import { productsAPI } from '../../services/api/products';
import { ProductCard } from '../../components/product/ProductCard';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  
  const { data: featuredProducts, isLoading } = useQuery(
    'featured-products',
    () => productsAPI.getProducts({ featured: true, limit: 10 })
  );

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero 배너 */}
      <View className="h-64 bg-blue-600 p-6 justify-center">
        <Text className="text-4xl font-bold text-white">Youniqle</Text>
        <Text className="text-xl text-white mt-2">
          프리미엄을 더 공정하게
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-white px-6 py-3 rounded-lg self-start"
          onPress={() => router.push('/products')}
        >
          <Text className="text-blue-600 font-semibold">쇼핑 시작하기</Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 */}
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">카테고리</Text>
        <View className="flex-row flex-wrap">
          {['패션', '뷰티', '홈리빙', '식품', '전자제품'].map((category) => (
            <TouchableOpacity
              key={category}
              className="w-1/3 p-2"
              onPress={() => router.push(`/products?category=${category}`)}
            >
              <View className="bg-gray-100 rounded-lg p-4 items-center">
                <Text className="text-4xl mb-2">🏷️</Text>
                <Text className="font-semibold">{category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 추천 상품 */}
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">추천 상품</Text>
        {isLoading ? (
          <Text>로딩 중...</Text>
        ) : (
          <View className="flex-row flex-wrap">
            {featuredProducts?.data.map((product) => (
              <View key={product.id} className="w-1/2 p-2">
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
```

#### ProductCard 컴포넌트

`components/product/ProductCard.tsx`:
```typescript
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export function ProductCard({ product }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-white rounded-lg overflow-hidden border border-gray-200"
      onPress={() => router.push(`/products/${product.id}`)}
    >
      <Image
        source={{ uri: product.images[0]?.url }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="font-semibold mb-1" numberOfLines={2}>
          {product.name}
        </Text>
        {product.originalPrice && (
          <Text className="text-gray-400 line-through text-sm">
            {product.originalPrice.toLocaleString()}원
          </Text>
        )}
        <Text className="text-blue-600 font-bold text-lg">
          {product.price.toLocaleString()}원
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

### 📅 Week 5-6: 장바구니 & 주문

#### 장바구니 화면

`app/(tabs)/cart.tsx`:
```typescript
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useRouter } from 'expo-router';
import { Trash2, Plus, Minus } from 'lucide-react-native';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalAmount, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Text className="text-2xl mb-4">🛒</Text>
        <Text className="text-xl font-semibold mb-2">장바구니가 비어있습니다</Text>
        <Text className="text-gray-600 mb-6 text-center">
          마음에 드는 상품을 담아보세요
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-8 py-3 rounded-lg"
          onPress={() => router.push('/products')}
        >
          <Text className="text-white font-semibold">쇼핑하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {items.map((item) => (
          <View key={item.productId} className="border-b border-gray-200 p-4">
            <View className="flex-row">
              <Image
                source={{ uri: item.product.images[0]?.url }}
                className="w-24 h-24 rounded"
              />
              <View className="flex-1 ml-4">
                <Text className="font-semibold mb-1">{item.product.name}</Text>
                <Text className="text-blue-600 font-bold mb-2">
                  {item.price.toLocaleString()}원
                </Text>
                
                {/* 수량 조절 */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
                    onPress={() => updateItem(item.productId, item.quantity - 1)}
                  >
                    <Minus size={16} color="#000" />
                  </TouchableOpacity>
                  
                  <Text className="mx-4 font-semibold">{item.quantity}</Text>
                  
                  <TouchableOpacity
                    className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
                    onPress={() => updateItem(item.productId, item.quantity + 1)}
                  >
                    <Plus size={16} color="#000" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="ml-auto"
                    onPress={() => removeItem(item.productId)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 하단 결제 버튼 */}
      <View className="border-t border-gray-200 p-4 bg-white">
        <View className="flex-row justify-between mb-4">
          <Text className="text-lg font-semibold">총 금액</Text>
          <Text className="text-2xl font-bold text-blue-600">
            {totalAmount.toLocaleString()}원
          </Text>
        </View>
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4"
          onPress={() => router.push('/orders/checkout')}
        >
          <Text className="text-white text-center font-semibold text-lg">
            결제하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### 📅 Week 7: 네이티브 기능

#### 푸시 알림

`services/notifications.ts`:
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerPushToken() {
  if (!Device.isDevice) {
    alert('물리적 기기에서만 푸시 알림이 작동합니다');
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // 서버에 토큰 전송
  await fetch('https://www.grigobio.co.kr/api/notifications/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  return token;
}
```

#### 카메라 & 이미지 업로드

`components/ImageUpload.tsx`:
```typescript
import { View, TouchableOpacity, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

export function ImageUpload({ onUpload }) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onUpload(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onUpload(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-row space-x-2">
      <TouchableOpacity
        className="flex-1 bg-blue-600 p-4 rounded-lg items-center"
        onPress={pickImage}
      >
        <Camera size={24} color="#FFF" />
        <Text className="text-white mt-2">갤러리</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="flex-1 bg-green-600 p-4 rounded-lg items-center"
        onPress={takePhoto}
      >
        <Camera size={24} color="#FFF" />
        <Text className="text-white mt-2">촬영</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 📅 Week 8: 앱스토어 배포

#### app.json 설정

```json
{
  "expo": {
    "name": "Youniqle",
    "slug": "youniqle",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.sapienet.youniqle",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.sapienet.youniqle",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      }
    },
    "plugins": [
      "expo-router",
      "expo-notifications"
    ]
  }
}
```

#### 빌드 명령어

```bash
# EAS Build 설정
eas build:configure

# iOS 빌드
eas build --platform ios --profile production

# Android 빌드
eas build --platform android --profile production

# 앱스토어 제출
eas submit --platform ios
eas submit --platform android
```

---

## 화면별 상세 설계

### 🏠 홈 화면

```
┌─────────────────────────────────┐
│  [로고]           [검색] [알림]    │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    Hero 배너 (스와이프)    │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  카테고리                         │
│  [🏷️패션] [💄뷰티] [🏠홈리빙]     │
│  [🍔식품] [💻전자]               │
│                                 │
│  추천 상품                        │
│  ┌─────┐  ┌─────┐              │
│  │상품1 │  │상품2 │              │
│  └─────┘  └─────┘              │
│                                 │
│  신상품                          │
│  ┌─────┐  ┌─────┐              │
│  │상품3 │  │상품4 │              │
│  └─────┘  └─────┘              │
│                                 │
├─────────────────────────────────┤
│  [홈]  [카테고리]  [장바구니]  [마이]  │
└─────────────────────────────────┘
```

### 🛍️ 상품 상세 화면

```
┌─────────────────────────────────┐
│  [←]                  [♡] [공유]  │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    상품 이미지 갤러리       │  │
│  │    (스와이프)              │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  상품명                          │
│  ⭐⭐⭐⭐⭐ 4.8 (120)            │
│                                 │
│  ₩99,000  30% ₩69,000          │
│                                 │
│  [상품정보] [리뷰] [문의]         │
│                                 │
│  상세 설명...                    │
│                                 │
├─────────────────────────────────┤
│  [장바구니]      [바로구매]        │
└─────────────────────────────────┘
```

### 🛒 장바구니 화면

```
┌─────────────────────────────────┐
│  장바구니                 [편집]   │
├─────────────────────────────────┤
│                                 │
│  ☑️ [이미지] 상품명               │
│     ₩69,000                     │
│     [-] 1 [+]            [삭제]  │
│  ─────────────────────────────  │
│  ☑️ [이미지] 상품명               │
│     ₩39,000                     │
│     [-] 2 [+]            [삭제]  │
│  ─────────────────────────────  │
│                                 │
│  쿠폰 적용                        │
│  [쿠폰 선택하기]         -10,000  │
│                                 │
│  포인트 사용                      │
│  [사용 가능: 5,000P]     -5,000  │
│                                 │
├─────────────────────────────────┤
│  총 금액             ₩93,000     │
│  [결제하기]                       │
└─────────────────────────────────┘
```

---

## API 통합 가이드

### 주요 API 엔드포인트

```typescript
// 인증
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/auth/me

// 상품
GET    /api/products
GET    /api/products/[id]
GET    /api/products/recommend

// 장바구니
GET    /api/cart
POST   /api/cart
PUT    /api/cart/update
DELETE /api/cart

// 주문
POST   /api/orders
GET    /api/orders
GET    /api/orders/[id]

// 결제
POST   /api/payment/request
POST   /api/payment/result

// 위시리스트
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist

// 리뷰
GET    /api/reviews
POST   /api/reviews

// 알림
GET    /api/notifications
POST   /api/notifications/register
```

---

## 테스트 시나리오

### ✅ 기능 테스트

#### 1. 인증 플로우
- [ ] 회원가입 → 이메일 인증 → 로그인
- [ ] 소셜 로그인 (구글)
- [ ] 로그아웃

#### 2. 쇼핑 플로우
- [ ] 홈 → 상품 검색 → 상품 상세
- [ ] 장바구니 추가 → 수량 변경
- [ ] 쿠폰 적용 → 포인트 사용
- [ ] 주문 → 결제 (테스트 모드)

#### 3. 마이페이지
- [ ] 프로필 수정
- [ ] 배송지 관리
- [ ] 주문 내역 조회
- [ ] 위시리스트 관리

#### 4. 네이티브 기능
- [ ] 푸시 알림 수신
- [ ] 카메라로 리뷰 사진 촬영
- [ ] 갤러리에서 이미지 선택

---

## 체크리스트

### Phase 1: PWA (2주)
- [ ] next-pwa 설치
- [ ] manifest.json 생성
- [ ] 아이콘 생성 (8개 크기)
- [ ] Service Worker 설정
- [ ] 모바일 네비게이션
- [ ] Pull-to-Refresh
- [ ] 설치 프롬프트
- [ ] Lighthouse PWA 점수 90+

### Phase 2: React Native (2개월)
- [ ] Expo 프로젝트 초기화
- [ ] API 클라이언트 설정
- [ ] 상태 관리 (Zustand)
- [ ] 인증 화면
- [ ] 홈 화면
- [ ] 상품 목록/상세
- [ ] 장바구니
- [ ] 주문/결제
- [ ] 마이페이지
- [ ] 푸시 알림
- [ ] 카메라 기능
- [ ] 앱스토어 배포

---

**총 개발 기간**: 2.5개월  
**예상 비용**: 5,000만원 - 7,000만원  
**다음 단계**: 파트너용 앱 개발



