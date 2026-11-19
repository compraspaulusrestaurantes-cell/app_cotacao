// Paulu's — service worker
// Rede primeiro (você sempre recebe a versão mais nova do app); se estiver sem internet, mostra a última versão guardada.
const CACHE = 'paulus-v2';

self.addEventListener('install', function(){ self.skipWaiting(); });

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;   // Supabase, fontes do Google etc. vão direto para a rede
  event.respondWith(
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function(res){   // 'no-cache': sempre confere com o servidor (sem ficar preso a uma cópia antiga do navegador)
      if(res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
      return res;
    }).catch(function(){
      return caches.match(req, { ignoreSearch: true }).then(function(hit){ return hit || caches.match('./'); });
    })
  );
});
