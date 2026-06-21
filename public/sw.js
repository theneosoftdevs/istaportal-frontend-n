// Service Worker — ISTA PORTAL PWA
// Stratégie : Network-first pour API, Cache-first pour assets statiques
const CACHE_VERSION = "ista-v5";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/ista.jpeg"];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

// ── Activate : purge old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("ista-") && k !== CACHE_VERSION)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (API) requests
  if (request.method !== "GET") return;
  if (!url.origin.startsWith(self.location.origin)) return;

  // API calls — always network, never cache
  if (url.pathname.startsWith("/api/")) return;

  // HTML navigation — network-first, fallback to cached /
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match("/") ?? caches.match("/index.html")),
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) — stale-while-revalidate
  const isAsset =
    url.pathname.includes("/assets/") ||
    /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Try to fetch a fresh asset; on failure, return cached if available.
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
            }
            return res;
          })
          .catch((err) => {
            // Network error while fetching asset
            console.warn("SW: asset fetch failed", request.url, err);
            return cached ?? caches.match("/index.html");
          });
      }),
    );
    return;
  }

  // Default — network with cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request)),
  );
});
