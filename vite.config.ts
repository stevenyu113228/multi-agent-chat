import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/' : '/',
  server: {
    host: true,
    // Disable host check to allow all hosts
    hmr: {
      host: 'localhost'
    },
    // Custom middleware to bypass host checking
    cors: true,
    proxy: {
      '/proxy': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy: any, options: any) => {
          proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
            const url = req.url || '';
            console.log('Original URL:', url);

            // Parse the URL to extract the actual target
            const match = url.match(/^\/proxy\/(https?:\/\/[^\/]+)(.*)/);
            if (match) {
              const targetHost = match[1];
              const targetPath = match[2] || '/';

              console.log('Target Host:', targetHost);
              console.log('Target Path:', targetPath);

              // Parse the target URL
              const targetUrl = new URL(targetHost);

              // Update the request
              proxyReq.setHeader('host', targetUrl.host);
              proxyReq.path = targetPath;

              // Update the proxy options dynamically
              options.target = targetHost;

              console.log('Proxying to:', targetHost + targetPath);
            }
          });
        },
        router: function(req: any) {
          const url = req.url || '';
          const match = url.match(/^\/proxy\/(https?:\/\/[^\/]+)/);
          if (match) {
            const target = match[1];
            console.log('Router returning:', target);
            return target;
          }
          return 'https://api.openai.com';
        }
      },
    },
  } as any,
  // Disable host check
  appType: 'spa',
  preview: {
    host: true,
    port: 5173,
    strictPort: false
  }
})