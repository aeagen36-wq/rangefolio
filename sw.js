// Replaces the old app's service worker at the GitHub Pages address:
// wipes every cache, hands control back to the network, and unregisters
// itself, so the "we've moved" page is what people see from now on.
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k)));
    await self.clients.claim();
    const cs = await self.clients.matchAll({ type: "window" });
    cs.forEach(c => c.navigate(c.url).catch(() => {}));
    await self.registration.unregister();
  })());
});
self.addEventListener("fetch", () => {});   // never serve from cache
