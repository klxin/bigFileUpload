// Worker线程
// 2.1 Worker 线程内部需要有一个监听函数，监听message事件
// 下面代码中，self代表子线程自身，即子线程的全局对象
self.addEventListener('message', function (e) {
  // 接受到消息后发送消息给主线程
  self.postMessage('我是worker线程，我接受到你传递过来的数据' + e.data)
})
// 2.2 self.close()用于在 Worker 内部关闭自身
// 2.3 Worker 加载脚本 Worker 内部如果要加载其他脚本，有一个专门的方法importScripts()。
// importScripts('script1.js');
// mportScripts('script1.js', 'script2.js');

// 2.4 主线程可以监听 Worker 是否发生错误。如果发生错误，Worker 会触发主线程的error事件。
/* worker.onerror(function (event) {
  console.log([
    'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
  ].join(''));
});

// 或者
worker.addEventListener('error', function (event) {
  // ...
}); */

// 2.5 关闭 Worker
// 主线程
// worker.terminate();
// Worker 线程
// self.close();
