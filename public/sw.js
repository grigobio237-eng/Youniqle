self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 기본 네트워크 우선 전략 (필요시 캐싱 로직 추가 가능)
  event.respondWith(fetch(event.request));
});
