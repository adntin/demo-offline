var VERSION = 'v1';

console.log('loaded sw.js');

self.addEventListener('install', function(event) {
  console.log('~~~~~~ event install ~~~~~~');
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
  console.log('~~~~~~ event activate ~~~~~~');
  var cacheWhitelist = [VERSION];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        if (!cacheWhitelist.includes(cacheName)) {
          console.log('%cDeleting out of date cache:', cacheName, 'color:green');
          return caches.delete(cacheName);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('~~~~~~ event fetch ~~~~~~');
  console.log('%cRequest url: ', 'color: purple', event.request.url); // Request Intercept
  // 劫持 HTTP 响应
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      console.log('%cResponse local asset: ', 'color:green', event.request.url); // Cache Storage
      return response;
    } else {
      console.log('%cResponse remote asset: ', 'color:blue', event.request.url); // Remote Server
      return fetch(event.request).then(function (response) {
        // 请求网络资源后, 保存到缓存中, 以便将来离线使用.
        caches.open(VERSION).then(function (cache) {
          cache.put(event.request, response);
        });
        return response.clone(); // 因为响应流只能被读取一次!!!
      })
    }
  }).catch(function() {
    console.log('%cResponse match error', 'color:red');
  }));
});

