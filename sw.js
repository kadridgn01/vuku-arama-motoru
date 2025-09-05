// Vuku — basit PWA önbellekleyici (app shell + yerel veri)
const CACHE = "vuku-light-v1";
const SHELL = ["./","./index.html","./manifest.json","./search-data.json"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  const isShell = SHELL.some(p=>url.pathname.endsWith(p.replace("./","/")));
  if(isShell){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }else{
    // network-first, cache fallback (yerel dosyalar için)
    e.respondWith(fetch(e.request).then(res=>{
      const copy = res.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return res;
    }).catch(()=>caches.match(e.request)));
  }
});
