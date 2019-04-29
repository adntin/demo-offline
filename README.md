### 注意
- 服务器绝对不能缓存sw.js文件, 否则无法升级
- sw.js需要放在根目录下, 如果放在/abc/sw.js，那么只能收到/abc/路径下的fetch事件（例如： /abc/page1/, /abc/page2/）
- 需要https, localhost和127.0.0.1可以使用
- 无法操作DOM, 可以通过postMessage发送消息
- 升级后需要关闭所有页签才会生效

### 其它

 - `from memory cache` 或者 `from disk cache`, DevTools --> Network --> Disable cache