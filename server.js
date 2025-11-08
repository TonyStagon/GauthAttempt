const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

const TARGET_PORT = 8081;
const PROXY_PORT = 5000;

console.log('Starting proxy server on port', PROXY_PORT, '...');

const proxy = httpProxy.createProxyServer({
  target: `http://localhost:${TARGET_PORT}`,
  ws: true,
  changeOrigin: true
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, (err) => {
    if (err) {
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Starting Expo...</title>
            <meta http-equiv="refresh" content="2">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #000;
                color: #fff;
              }
              .loading {
                text-align: center;
              }
              .spinner {
                border: 4px solid #333;
                border-top: 4px solid #00BCD4;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="loading">
              <div class="spinner"></div>
              <h2>Starting Expo Development Server...</h2>
              <p>Please wait while the app initializes...</p>
              <p style="color: #888; font-size: 14px;">This page will auto-refresh</p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

proxy.on('error', () => {
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`✓ Proxy server running on http://0.0.0.0:${PROXY_PORT}`);
  console.log(`✓ Waiting for Expo web on port ${TARGET_PORT}...\n`);
  
  console.log('Starting Expo development server...');
  const expo = spawn('npx', ['expo', 'start', '--web'], {
    cwd: __dirname,
    env: { ...process.env },
    stdio: 'inherit'
  });

  process.on('SIGINT', () => {
    expo.kill();
    process.exit();
  });

  process.on('SIGTERM', () => {
    expo.kill();
    process.exit();
  });
});
