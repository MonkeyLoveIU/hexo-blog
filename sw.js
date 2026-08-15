const VERSION = "1786806200628";const preCache = ["/images/taichi.png","/images/banner.webp","/css/loader.css","/css/style.css","/css/reading-optimization.css","/js/script.js"];const cacheDomain = [
  "fonts.googleapis.com",
  "npm.webcache.cn",
  "unpkg.com",
  "fastly.jsdelivr.net",
  "cdn.jsdelivr.net",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(preCache)));
});

async function putInCache(request, response) {
  if (!response || !response.ok || response.type === "opaque") return response;
  const cache = await caches.open(VERSION);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    return await putInCache(request, await fetch(request));
  } catch (error) {
    return (await caches.match(request)) || caches.match("/");
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => putInCache(request, response))
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.search) {
    event.respondWith(fetch(request));
    return;
  }

  // 页面导航优先网络，避免发布后长期展示旧 HTML；离线时回退缓存。
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源和可信 CDN 使用 stale-while-revalidate，兼顾速度与更新。
  if (url.origin === self.location.origin || cacheDomain.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) =>
          cacheName === VERSION ? undefined : caches.delete(cacheName)
        )
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
