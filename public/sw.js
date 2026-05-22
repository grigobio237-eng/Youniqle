const CACHE_NAME = 'youniqle-pwa-cache-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 오프라인 폴백 페이지 및 기본 에셋 사전 캐싱
      return cache.addAll([
        OFFLINE_URL,
        '/',
        '/character/youniqle-1.png'
      ]);
    })
  );
  self.skipWaiting();
});

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
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // HTTP(S) 요청이 아닌 경우(chrome-extension 등) 브라우저 기본 동작으로 위임
  if (!url.startsWith('http')) return;

  // 개발 서버 HMR/Webpack 내부 요청은 Service Worker가 관여하지 않음
  if (url.includes('/_next/webpack') || url.includes('/__nextjs')) return;

  // 네트워크 우선 전략 (실패 시 graceful fallback)
  event.respondWith(
    fetch(event.request).catch(() => {
      // 네비게이션 요청 실패 시 오프라인 폴백 (/offline 캐시 응답)
      if (event.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL) || caches.match('/') || new Response('Offline', { status: 503 });
      }
      return caches.match(event.request) || new Response('Network error', { status: 503 });
    })
  );
});

// 푸시 알림 수신 이벤트
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/character/youniqle-1.png',
      badge: data.badge || '/character/youniqle-1.png',
      data: data.data,
      tag: data.tag || 'youniqle-notif',
      renotify: data.renotify !== undefined ? data.renotify : true,
      silent: data.silent || false,
      vibrate: [100, 50, 100]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error in push event:', error);
  }
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 이미 열려있는 창이 있으면 포커스
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새로 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
