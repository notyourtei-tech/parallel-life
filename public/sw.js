// 简易 Service Worker：提供离线兜底与静态资源缓存。
// 策略：
//  - 导航请求（HTML）走「网络优先」，断网时回退到离线页 /offline.html，避免白屏。
//  - Next 静态资源（/_next/static，内容带哈希、不可变）走「缓存优先」。
//  - 不缓存 /api/*（涉及实时 AI 调用与限流）。
const CACHE = 'parallel-life-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 单条资源缺失（如 icon 路径变动）不应令整个 SW 安装失败，故用 allSettled。
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // 导航请求：网络优先，失败回退离线页
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error())),
    );
    return;
  }

  // 不可变静态资源：缓存优先
  if (url.pathname.startsWith('/_next/static/') || PRECACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return resp;
          }),
      ),
    );
  }
});
