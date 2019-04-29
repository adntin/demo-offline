// https://developers.google.com/web/fundamentals/primers/service-workers/
console.log('loaded sw.js');
var VERSION = 'v1';

// 1. 打开缓存。
// 2. 缓存文件。
// 3. 确认所有需要的资产是否已缓存。
self.addEventListener('install', function(event) {
  console.log('~~~~~~ install event ~~~~~~');
  // event.waitUntil() 方法带有 promise 参数并使用它来判断安装所花费的时间，以及安装是否成功。
  //console.log(1);
  event.waitUntil(
    caches.open(VERSION).then(function(cache) {
      //console.log(3);
      return cache.addAll([
        './',
        './index.html',
        // './style.css',
        // './script.js',
      ]);
    }).catch(function(){
      console.error('Service worker install event error.');
    })
  );
  //console.log(2)
});

// 1. 更新您的服务工作线程 sw.js 文件。 用户导航至您的站点时，浏览器会尝试在后台重新下载定义 Service Worker 的脚本文件。 
//    如果 Service Worker 文件与其当前所用文件存在字节差异，则将其视为 _新 Service Worker_。
// 2. 新 Service Worker 将会启动，且将会触发 install 事件。
// 3. 此时，旧 Service Worker 仍控制着当前页面，因此新 Service Worker 将进入 waiting 状态。
// 4. 当网站上当前打开的页面关闭时，旧 Service Worker 将会被终止，新 Service Worker 将会取得控制权。
// 5. 新 Service Worker 取得控制权后，将会触发其 activate 事件。
this.addEventListener('activate', function(event) {
  console.log('~~~~~~ activate event ~~~~~~');
  var cacheWhitelist = [VERSION];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          console.log('%cDeleting out of date cache:', cacheName, 'color:green');
          return caches.delete(cacheName);
        }
      }));
    }).catch(function(){
      console.error('Service worker activate event error.');
    })
  );
});

// 1. 在 fetch 请求中添加对 .then() 的回调。
// 2. 获得响应后，执行以下检查：
//      a. 确保响应有效。
//      b. 检查并确保响应的状态为 200。
//      c. 确保响应类型为 basic，亦即由自身发起的请求。 这意味着，对第三方资产的请求也不会添加到缓存。
// 3. 如果通过检查，则克隆响应。 这样做的原因在于，该响应是数据流， 因此主体只能使用一次。 
//    由于我们想要返回能被浏览器使用的响应，并将其传递到缓存以供使用，因此需要克隆一份副本。我们将一份发送给浏览器，另一份则保留在缓存。
self.addEventListener('fetch', function(event) {
  console.log('~~~~~~ fetch event ~~~~~~');
  console.log('%cRequest url: ', 'color: purple', event.request.url); // Request Intercept
  // 劫持 HTTP 响应
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('%cResponse local asset: ', 'color:green', event.request.url); // Cache Storage
        return response;
      } else {
        console.log('%cResponse remote asset: ', 'color:blue', event.request.url); // Remote Server
        return fetch(event.request).then(function (response) {
          // 如果添加这个判断, 不会缓存 cdn文件(jquery) 和 api数据(github)
          // if(!response || response.status !== 200 || response.type !== 'basic') {
          //   return response;
          // } 
          // 请求网络资源后, 保存到缓存中, 以便将来离线使用.
          const responseToCache = response.clone(); // 注意: 响应流只能被读取一次!!!
          caches.open(VERSION).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
      }
    }).catch(function() {
      console.error('Service worker fetch event error.');
    })
  );
});

// 无返回值
// event.waitUntil()
// event.respondWith()
