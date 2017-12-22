var VERSION = 'v2';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(VERSION).then(function(cache) {
      return cache.addAll([
        './index.html',
        // './style.css',
        // './script.js',
      ]);
    })
  );
});

this.addEventListener('activate', function(event) {
  var cacheWhitelist = [VERSION];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          // console.log('Deleting out of date cache:', cacheName);
          return caches.delete(cacheName);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Request url: ', event.request.url); // Request Intercept
  // 劫持 HTTP 响应
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      console.log('Response local asset: ', event.request.url); // Cache Storage
      return response;
    } else {
      console.log('Response remote asset: ', event.request.url); // Remote Server
      return fetch(event.request).then(function (response) {
        // 请求网络资源后, 保存到缓存中, 以便将来离线使用.
        caches.open(VERSION).then(function (cache) {
          cache.put(event.request, response);
        });
        return response.clone(); // 因为响应流只能被读取一次!!!
      })
    }
  }).catch(function() {
    console.log('Response match error');
  }));
});

