// Vuku Service Worker — basit app-shell cache
const CACHE = "vuku-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for API, cache-first for app shell
self.addEventListener("fetch", (e)=>{
  const req = e.request;
  const url = new URL(req.url);
  const isAppShell = APP_SHELL.some(p => url.pathname.endsWith(p.replace("./","/")));
  if(isAppShell){
    e.respondWith(caches.match(req).then(c => c || fetch(req)));
    return;
  }
  // API & others: try network, fall back to cache
  e.respondWith(
    fetch(req).then(res=>{
      const clone = res.clone();
      caches.open(CACHE).then(c=>c.put(req, clone)).catch(()=>{});
      return res;
    }).catch(()=> caches.match(req))
  );
});
