// sw.js — Service Worker：离线缓存
const CACHE_NAME = "recipe-farm-v3";

const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/manifest.json",
  "/js/config.js",
  "/js/state.js",
  "/js/utils.js",
  "/js/app.js",
  "/js/screens/dashboard.js",
  "/js/screens/farm.js",
  "/js/screens/supermarket.js",
  "/js/screens/kitchen.js",
  "/js/screens/inventory.js",
  "/js/screens/recipes.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
