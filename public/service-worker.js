const CACHE_NAME = "book-my-show-v13"; // Updated version number

// Files to cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/scripts.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event: cache the necessary files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Force the new service worker to activate immediately
  self.skipWaiting();
});

// Activate event: remove old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Keep only the new cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of any open pages
});

// Fetch event: network-first strategy for index.html, cache-first for others
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Handle HTML files (index.html) with a network-first strategy
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  } else {
    // Handle other requests (CSS, JS, icons) with a cache-first strategy
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
