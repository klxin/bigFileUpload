/**
 * 服务入口
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
// 在这里我们使用koa-static库来实现托管静态资源
const koaStatic = require('koa-static');
// 在这里我们使用koa-body库来实现解析和文件的保存
const koaBody = require('koa-body');

// 创建
const app = new Koa();
const port = process.env.PORT || '8100';

const uploadHost = `http://localhost:${port}/uploads/`;

// 解析文件上传配置
app.use(
  koaBody({
    multipart: true, //  开启文件上传，默认是关闭
    formidable: {
      //设置文件的默认保存目录，不设置则保存在系统临时目录下
      uploadDir: path.resolve(__dirname, '../static/uploads'),
    },
  })
);

// 托管静态资源
app.use(koaStatic(path.resolve(__dirname, '../static')));

// 服务端也需要进行简单的调整，由单文件对象变为多文件数组，然后进行遍历处理。
app.use((ctx) => {
  let files = []
  if (ctx.request.files.f1) {
    files = Array.isArray(ctx.request.files.f1) ? ctx.request.files.f1 : [ctx.request.files.f1]; // 多文件 获取文件对象
  }
  // console.log(files, 3333);
  let body = ctx.request.body
  let fileToken = body.token; // 文件标识
  let fileIndex = body.index; // 文件顺序
  // 遍历处理
  files &&
    files.forEach((file) => {
      // 获取原来的文件路径和文件名
      let filePath = file && file.path;
      if (filePath && file.size > 0 ) {
        // 继续处理
        // let ext = path.extname(fileName);
        // let nextPath = filePath + ext;
        let nextPath = filePath.slice(0, filePath.lastIndexOf('\\') + 1) + + fileIndex + '-' + fileToken;
        // console.log(nextPath);
        fs.renameSync(filePath, nextPath);
      }
    });

  // 如果body.type === 'merge'说明前端所有切片已经上传完毕 服务端开始合并所有切片
  if (body.type === 'merge') {
    let filename = body.filename,
    chunkCount = body.chunkCount,
    folder = path.resolve(__dirname, '../static/uploads') + '/';
    // console.log(folder)
    let writeStream = fs.createWriteStream(`${folder}${filename}`)
    let cindex = 0
    mergeFileFn()
    ctx.body = `{
      "filesUrl":${uploadHost}${filename}
    }`;
    // 开始合并文件
    // 合并文件这里使用 stream pipe 实现，这样更节省内存，边读边写入，占用内存更小，效率更高，代码见fnMergeFile方法。
    function mergeFileFn () {
      let fname = `${folder}${cindex}-${fileToken}`
      let readStream = fs.createReadStream(fname)
      readStream.pipe(writeStream, {end: cindex + 1 == chunkCount ? true : false })
      readStream.on('end', function () {
        // 删除文件
        fs.unlink(fname, function (err) {
          if (err) throw err
        })
        if (cindex + 1 < chunkCount) {
          cindex += 1
          mergeFileFn()
        }
      })
    }
  } else {
    ctx.body = `{
      status: 201,
      title: '文件上传成功'
    }`
  }
});

/**
 * http server
 */
const server = http.createServer(app.callback());
server.listen(port);
console.log('demo1 server start ...... http://localhost:8100  ');
