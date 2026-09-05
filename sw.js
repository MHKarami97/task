const CACHE_NAME = "task-v1.0.4";
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

// Helper function to determine if a URL should be cached
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

// Installation of caching patterns.
// Deliberately NOT using cache.addAll() — it is all-or-nothing: a single
// missing/renamed file (404) rejects the whole install, the new service
// worker gets marked "redundant" instead of "installed", and the
// "new version available" banner then never fires (this was the actual
// bug: bumping CACHE_NAME alone couldn't fix it because install itself
// was failing). Caching each URL independently means one bad entry only
// logs a warning instead of blocking every future update forever.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[sw] failed to precache "${url}" — skipping`, err);
          }),
        ),
      ),
    ),
  );
});

// Send message to all clients when new version is ready
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

// Listen for skip waiting message from page
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch and cache strategy with offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          if (shouldCache(event.request.url)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch((error) => {
          console.log("Fetch failed:", error);

          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_PAGE);
          }

          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            throw error;
          });
        });
    }),
  );
});

// Background sync event
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log("Syncing data...");
}

// Push notification event — expects a JSON payload { title, body, url, taskId }
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
