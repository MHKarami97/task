const CACHE_NAME = "task-reminder-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/variables.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/responsive.css",
  "./js/app.js",
  "./js/router.js",
  "./js/utils/PersianDate.js",
  "./js/models/Task.js",
  "./js/models/TaskList.js",
  "./js/repositories/StorageAdapter.js",
  "./js/repositories/TaskRepository.js",
  "./js/repositories/ListRepository.js",
  "./js/services/EventBus.js",
  "./js/services/ThemeManager.js",
  "./js/services/NotificationService.js",
  "./js/services/SortStrategy.js",
  "./js/controllers/TaskController.js",
  "./js/views/TasksView.js",
  "./js/views/CalendarView.js",
  "./js/views/AboutView.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Cache-first strategy for static assets, network fallback for navigation requests.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

// Handles reminder notifications scheduled by NotificationService while the app is closed.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const hadWindow = clientsArr.some((client) => {
        if (client.url.includes("index.html")) {
          client.focus();
          return true;
        }
        return false;
      });
      if (!hadWindow) self.clients.openWindow("./index.html");
    })
  );
});
