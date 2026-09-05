class ServiceWorkerManager {
  constructor() {
    this.CACHE_VERSION = "1.0.11";
    this.CACHE_NAME = `task-v${this.CACHE_VERSION}`;
    this.OFFLINE_PAGE = "/offline.html";

    this.urlsToCache = [
      "./",
      "./index.html",
      this.OFFLINE_PAGE,
      "./manifest.json",
      "./css/variables.css",
      "./css/base.css",
      "./css/layout.css",
      "./css/components.css",
      "./css/responsive.css",
      "./assets/icons/favicon-192.png",
      "./assets/icons/favicon-512.png",
      "/assets/fonts/Vazirmatn-font-face.css",
      "/assets/fonts/webfonts/Vazirmatn-Regular.woff2",
      "/assets/fonts/webfonts/Vazirmatn-Bold.woff2",
    ];

    this._bindEvents();
  }

  _bindEvents() {
    self.addEventListener("install", this._onInstall.bind(this));
    self.addEventListener("activate", this._onActivate.bind(this));
    self.addEventListener("message", this._onMessage.bind(this));
    self.addEventListener("fetch", this._onFetch.bind(this));
    self.addEventListener("push", this._onPush.bind(this));
    self.addEventListener(
      "notificationclick",
      this._onNotificationClick.bind(this),
    );
    self.addEventListener("sync", this._onSync.bind(this));
  }

  /**
   * [1] Install Event: Pre-caching core assets.
   * Using {cache: "no-store"} ONLY here to ensure we bypass browser disk cache
   * and fetch the truly latest files during the update phase.
   */
  _onInstall(event) {
    self.skipWaiting(); // اختیاری: اگر می‌خواهید آپدیت‌ها در بک‌گراند فوراً اعمال شوند. اگر کاربر باید تایید کند، این خط را بردارید.

    event.waitUntil(
      caches.open(this.CACHE_NAME).then((cache) =>
        Promise.allSettled(
          this.urlsToCache.map((url) =>
            fetch(url, { cache: "no-store" })
              .then((response) => {
                if (!response.ok)
                  throw new Error(`HTTP ${response.status} for ${url}`);
                return cache.put(url, response);
              })
              .catch((err) =>
                console.warn(`[SW] Pre-cache failed for ${url}:`, err),
              ),
          ),
        ),
      ),
    );
  }

  /**
   * [2] Activate Event: Cleaning up old caches.
   */
  _onActivate(event) {
    const cacheWhitelist = [this.CACHE_NAME];
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (!cacheWhitelist.includes(cacheName)) {
                console.log(`[SW] Deleting old cache: ${cacheName}`);
                return caches.delete(cacheName);
              }
            }),
          );
        })
        .then(() => self.clients.claim()), // بلافاصله کنترل کلاینت‌ها را به دست می‌گیرد
    );
  }

  /**
   * [3] Message Event: Handle commands from UI (app.js).
   */
  _onMessage(event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
  }

  /**
   * [4] Fetch Event: Intelligent Caching Strategy.
   */
  _onFetch(event) {
    if (event.request.method !== "GET") return;

    // استراتژی Network-First با Fallback به کش آفلاین برای نویگیشن (صفحات HTML)
    if (event.request.mode === "navigate") {
      event.respondWith(
        fetch(event.request).catch(() => caches.match(this.OFFLINE_PAGE)),
      );
      return;
    }

    // استراتژی Cache-First برای فایل‌های استاتیک (CSS, JS, Fonts, Images)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // درخواست از شبکه بدون no-store مخرب
        return fetch(event.request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === "error"
            ) {
              return networkResponse;
            }

            // داینامیک کشینگ برای فایل‌های جدید
            if (this._shouldCacheDynamically(event.request.url)) {
              const responseToCache = networkResponse.clone();
              caches.open(this.CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.error("[SW] Fetch failed:", error);
            throw error;
          });
      }),
    );
  }

  /**
   * Helper: Determines if a non-precached URL should be stored dynamically.
   */
  _shouldCacheDynamically(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // کش کردن استایل‌ها، اسکریپت‌ها و مدیاها
    if (
      pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
    ) {
      return true;
    }

    // کش کردن روتین‌های هم‌مبدا
    if (
      urlObj.origin === self.location.origin &&
      (pathname.endsWith("/") || pathname.endsWith(".html"))
    ) {
      return true;
    }

    return false;
  }

  /**
   * [5] Push Notification Event.
   */
  _onPush(event) {
    let payload = { title: "یادآور", body: "شما یک کار جدید دارید" };
    try {
      if (event.data) payload = event.data.json();
    } catch (err) {
      console.error("[SW] Failed to parse push payload:", err);
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
  }

  /**
   * [6] Notification Click Event.
   */
  _onNotificationClick(event) {
    event.notification.close();
    const targetUrl = event.notification.data?.url ?? "./#tasks";

    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          const existingClient = clientList.find((client) =>
            client.url.includes(targetUrl),
          );
          if (existingClient) {
            return existingClient.focus();
          }
          return self.clients.openWindow(targetUrl);
        }),
    );
  }

  /**
   * [7] Background Sync Event.
   */
  _onSync(event) {
    if (event.tag === "sync-data") {
      console.log("[SW] Syncing data in background...");
      // اینجا منطق ارسال داده‌های ذخیره شده در IndexedDB به سرور پیاده‌سازی می‌شود
    }
  }
}

// Instantiate and start the Service Worker Manager
new ServiceWorkerManager();
