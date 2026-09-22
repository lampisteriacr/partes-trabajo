const CACHE='lampisteria-cr-shell-v2-20260922-continuar';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const scope=new URL(self.registration.scope);
const LIBRARIES=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(file=>'https://www.gstatic.com/firebasejs/10.12.2/'+file).concat(['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js']);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async cache=>{await cache.addAll(CORE);await Promise.allSettled(LIBRARIES.map(url=>cache.add(url)));})));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lampisteria-cr-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET')return;
 const own=url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
 const staticOwn=own&&(req.mode==='navigate'||/\/(index\.html|manifest\.webmanifest|icon-(192|512)\.png)$/.test(url.pathname));
 const library=(url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/10.12.2/')&&url.pathname.endsWith('.js'))||(url.origin==='https://cdnjs.cloudflare.com'&&/^\/ajax\/libs\/(html2canvas\/1\.4\.1|jspdf\/2\.5\.1)\//.test(url.pathname));
 // Never cache Firebase data, authentication requests, arbitrary pages or user photographs.
 if(!staticOwn&&!library)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=req.mode==='navigate'?new URL('index.html',scope).href:req;
  try{const res=await fetch(req);if(res.ok&&res.type!=='opaque')await cache.put(key,res.clone());return res;}
  catch(e){const cached=await cache.match(key);if(cached)return cached;throw e;}
 })());
});
