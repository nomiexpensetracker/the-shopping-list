/**
 * The Shopping List — Service Worker
 *
 * Caching strategies:
 *  - App shell / pages  : StaleWhileRevalidate (fast load + background update)
 *  - API routes         : NetworkFirst (fresh data preferred, cached as fallback)
 *  - Static images      : CacheFirst (long-lived assets)
 *  - Google Fonts       : CacheFirst (immutable CDN assets)
 *  - Offline fallback   : /offline shown for uncached navigation requests
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;

const OFFLINE_URL = "/offline";

// Precache the offline fallback page on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting())
  );
});

// Clean up old cache versions on activate
self.addEventListener("activate", (event) => {
  const keepCaches = [STATIC_CACHE, API_CACHE, IMAGE_CACHE, FONT_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !keepCaches.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Helper: NetworkFirst ──────────────────────────────────────────────────
async function networkFirst(request, cacheName, timeoutMs = 10000) {
  const cache = await caches.open(cacheName);

  const networkPromise = fetch(request.clone()).then((response) => {
    if (response.ok || response.status === 0) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Race network against timeout; fall back to cache if slow/offline
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), timeoutMs)
  );

  try {
    return await Promise.race([networkPromise, timeout]);
  } catch {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

// ─── Helper: CacheFirst ────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request.clone());
  if (response.ok || response.status === 0) {
    cache.put(request, response.clone());
  }
  return response;
}

// ─── Helper: StaleWhileRevalidate ─────────────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request.clone()).then((response) => {
    if (response.ok || response.status === 0) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached ?? networkFetch;
}

// ─── Fetch handler ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from same origin or known CDNs
  if (request.method !== "GET") return;

  // Google Fonts — CacheFirst
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Same-origin only beyond this point
  if (url.origin !== self.location.origin) return;

  // API routes — NetworkFirst
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static images — CacheFirst
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Navigation requests (HTML pages) — StaleWhileRevalidate with offline fallback
  if (request.destination === "document") {
    event.respondWith(
      staleWhileRevalidate(request, STATIC_CACHE).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match(OFFLINE_URL)) ?? Response.error();
      })
    );
    return;
  }

  // JS/CSS — StaleWhileRevalidate
  if (/\.(?:js|css)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});
