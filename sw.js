var VERSION = 'v1';

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
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('request url: ', event.request.url);
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        let responseClone = response.clone();
        caches.open(VERSION).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        console.log('fetch error')
        return caches.match('./index.html');
      });
    }
  }).catch(function() {
    console.log('match error')
    return fetch(event.request);
  }));
});

