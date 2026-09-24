import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { createCashfreeOrder, verifyCashfreeOrder } from './server/cashfreeHandler.js';

dotenv.config();

function cashfreeDevPlugin(): Plugin {
  return {
    name: 'cashfree-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Create Cashfree Order Endpoint
        if (req.url === '/api/create-cashfree-order' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const result = await createCashfreeOrder(data);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Order creation failed' }));
            }
          });
          return;
        }

        // Verify Cashfree Order Endpoint
        if (req.url?.startsWith('/api/verify-cashfree-order')) {
          try {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const orderId = parsedUrl.searchParams.get('orderId');
            if (!orderId) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'orderId parameter is required' }));
              return;
            }
            const result = await verifyCashfreeOrder(orderId);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Order verification failed' }));
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      cashfreeDevPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
