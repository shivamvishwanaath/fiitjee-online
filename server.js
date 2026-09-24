import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createCashfreeOrder, verifyCashfreeOrder } from './server/cashfreeHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API: Create Cashfree Order
app.post('/api/create-cashfree-order', async (req, res) => {
  try {
    const { orderAmount, studentName, customerName, studentEmail, customerEmail, studentPhone, customerPhone, orderId, order_id, returnUrl } = req.body || {};
    
    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({ error: 'Valid order amount is required' });
    }

    const orderData = await createCashfreeOrder({
      orderAmount: Number(orderAmount),
      studentName,
      customerName,
      studentEmail,
      customerEmail,
      studentPhone,
      customerPhone,
      orderId: orderId || order_id,
      returnUrl
    });

    res.json(orderData);
  } catch (error) {
    console.error('Error creating Cashfree order:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment session' });
  }
});

// API: Verify Cashfree Order
app.all('/api/verify-cashfree-order', async (req, res) => {
  try {
    const orderId = req.query.orderId || req.query.order_id || req.body?.orderId || req.body?.order_id;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId parameter is required' });
    }

    const verification = await verifyCashfreeOrder(orderId);
    res.json(verification);
  } catch (error) {
    console.error('Error verifying Cashfree order:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment status' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'Cashfree',
    entity: 'TRANSED LLP',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TRANSED LLP Portal] Server running on port ${PORT}`);
  console.log(`Cashfree Gateway active in production mode`);
});
