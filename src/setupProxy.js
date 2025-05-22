// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

// This file is only used during local development
// It will not affect production builds
module.exports = function(app) {
  // Only set up proxies in development mode
  if (process.env.NODE_ENV === 'development') {
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
    
    // Only for local development - this will never run in production
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
  }
};
