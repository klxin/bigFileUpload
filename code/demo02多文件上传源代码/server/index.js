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
  let files = ctx.request.files.f1; // 多文件 获取文件对象
  let result = [];
  // 遍历处理
  files &&
    files.forEach((file) => {
      // 获取原来的文件路径和文件名
      let filePath = file.path;
      let fileName = file.name;
      // if (file.size <= 0 || filePath) return ctx.body = '上传出错了';
      // 继续处理
      let ext = path.extname(fileName);
      let nextPath = filePath + ext;
      console.log(nextPath);
      fs.renameSync(filePath, nextPath);
      result.push(`${uploadHost}${nextPath.slice(nextPath.lastIndexOf('\\') + 1)}`);
    });
  // 输出 json 结果
  ctx.body = `{
  "filesUrl":${JSON.stringify(result)}
  }`;
});

/**
 * http server
 */
const server = http.createServer(app.callback());
server.listen(port);
console.log('demo1 server start ......   ');
