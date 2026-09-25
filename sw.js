// Rangefolio service worker: cache the app shell so it opens with no signal.
// The cache name comes from build.js - bump RF_BUILD.n there on every
// deploy and this worker installs fresh, then clears the old cache.
importScripts("build.js");
const VERSION = "rangefolio-b" + RF_BUILD.n;
const SHELL = ["./", "./index.html", "./build.js", "./engine.js", "./targets.js", "./app-more.js",
  "./data/drills.json", "./data/loads.json", "./data/classes.json", "./data/roadmap.json", "./data/builds.json",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;               // weather etc. go straight out
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => { if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
self.addEventListener("message", e => { if (e.data === "build?") e.source.postMessage({ build: RF_BUILD.n }); });
