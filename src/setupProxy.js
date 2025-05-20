// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Intercept API requests and redirect them to the local backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5003',
      changeOrigin: true,
      secure: false, // Accept self-signed certificates in development
      logLevel: 'debug', // Log all proxy activity for debugging
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          message: 'Backend connection error. Make sure your backend server is running on port 5003.',
          error: process.env.NODE_ENV === 'development' ? err.message : 'Proxy error'
        }));
      },
      onProxyReq: (proxyReq, req, res) => {
        // This runs before forwarding the request to the target
        console.log(`[Proxy] ${req.method} ${req.originalUrl} → http://localhost:5003${req.url}`);
      }
    })
  );
  
  // Also intercept any requests to bcrm.dev and redirect them locally
  app.use(
    '/*/bcrm.dev*',
    createProxyMiddleware({
      target: 'http://localhost:5003',
      changeOrigin: true,
      pathRewrite: {
        '^.*/bcrm\\.dev/api': '/api'
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Intercepted bcrm.dev request: ${req.originalUrl} → http://localhost:5003/api`);
      }
    })
  );
};
