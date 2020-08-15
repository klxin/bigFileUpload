// 监听主线程消息生成 hash
// 引入sparkmd5
self.importScripts('spark-md5.min.js');
self.onmessage = function (e) {
  console.log(e.data)
  let { chunks: fileChunkList } = e.data;
  console.log(fileChunkList, 99999)
  const spark = new self.SparkMD5.ArrayBuffer();
  // let percentage = 0;
  let count = 0;
  const loadNext = (index) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index]);
    reader.onload = (e) => {
      count++;
      spark.append(e.target.result);
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,
          hash: spark.end(),
        });
        self.close();
      } else {
        // percentage += 100 / fileChunkList.length;
        // self.postMessage({
        //   percentage,
        // });
        // 递归计算下一个切片
        loadNext(count);
      }
    };
  };
  loadNext(0);
};
