const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 开发环境中API请求代理
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:8000',
      changeOrigin: true,
      // 不重写路径
      logLevel: 'debug',
      // 添加更多配置以确保请求正确传递
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        console.log('代理请求:', req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('代理响应:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('代理请求错误: ' + err);
      }
    })
  );
}; 