const CACHE_NAME = "task-v1.0.6";
const OFFLINE_PAGE = "/offline.html";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/variables.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/responsive.css",
  "./assets/icons/favicon-192.png",
  "./assets/icons/favicon-512.png",
  "/assets/fonts/Vazirmatn-font-face.css",
  "/assets/fonts/webfonts/Vazirmatn-Black.woff2",
  "/assets/fonts/webfonts/Vazirmatn-Bold.woff2",
  "/assets/fonts/webfonts/Vazirmatn-ExtraBold.woff2",
  "/assets/fonts/webfonts/Vazirmatn-ExtraLight.woff2",
  "/assets/fonts/webfonts/Vazirmatn-Light.woff2",
  "/assets/fonts/webfonts/Vazirmatn-Medium.woff2",
  "/assets/fonts/webfonts/Vazirmatn-Regular.woff2",
  "/assets/fonts/webfonts/Vazirmatn-SemiBold.woff2",
  "/assets/fonts/webfonts/Vazirmatn-Thin.woff2",
];

function shouldCache(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  if (
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return true;
  }

  if (
    urlObj.origin === self.location.origin &&
    (pathname.endsWith("/") || pathname.endsWith(".html"))
  ) {
    return true;
  }

  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        urlsToCache.map((url) =>
          fetch(url, { cache: "no-store" })
            .then((response) => {
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return cache.put(url, response);
            })
            .catch((err) => {
              console.warn(`[sw] failed to precache "${url}" — skipping`, err);
            }),
        ),
      ),
    ),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_UPDATED",
              message: "نسخه جدید در دسترس است",
            });
          });
        });
      }),
  );

  return self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch strategy — network fetch now also uses { cache: "no-store" } for
// the same reason as install: this is what actually fixes "I have to
// manually open the file's DevTools entry and clear its cache" — that was
// the browser's disk cache serving fetch() a stale response even though
// Cache Storage itself was already empty for that URL.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request.url, { cache: "no-store" })
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === "error"
          ) {
            return networkResponse;
          }

          if (shouldCache(event.request.url)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch((error) => {
          console.log("Fetch failed:", error);

          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_PAGE);
          }

          return caches.match(event.request).then((cachedResponse2) => {
            if (cachedResponse2) {
              return cachedResponse2;
            }
            throw error;
          });
        });
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log("Syncing data...");
}

self.addEventListener("push", (event) => {
  let payload = { title: "یادآور", body: "" };

  try {
    if (event.data) payload = event.data.json();
  } catch (err) {
    console.error("[sw] failed to parse push payload", err);
    return;
  }

  const options = {
    body: payload.body,
    icon: "./assets/icons/favicon-192.png",
    badge: "./assets/icons/favicon-96.png",
    dir: "rtl",
    lang: "fa",
    vibrate: [100, 50, 100],
    tag: payload.taskId ?? "task-reminder",
    renotify: true,
    data: { url: payload.url ?? "./#tasks", taskId: payload.taskId ?? null },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "./#tasks";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((client) =>
          client.url.includes(targetUrl),
        );
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});
