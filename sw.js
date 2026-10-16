const CACHE_NAME = "rainbow-square-v1";

self.addEventListener("install", (event) => {
  // Activate the new worker without waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("rainbow-square-") &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle same-origin GET requests.
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Network-first: check the server for the latest version.
        const response = await fetch(request);

        // Cache successful, non-opaque responses only.
        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        // If offline, use the previously cached response.
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // If an offline page navigation has no exact cache match,
        // fall back to the cached index.html, if available.
        if (request.mode === "navigate") {
          const indexURL = new URL(
            "./index.html",
            self.registration.scope
          );

          const cachedIndex = await cache.match(indexURL);

          if (cachedIndex) {
            return cachedIndex;
          }
        }

        // Nothing cached: let the browser handle the network failure.
        throw error;
      }
    })()
  );
});