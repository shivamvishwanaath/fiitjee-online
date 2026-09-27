import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createCashfreeOrder, verifyCashfreeOrder } from './server/cashfreeHandler.js';
import { sendCrmCampaign, testSmtpConnection } from './server/emailHandler.js';

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

// API: Test Centre SMTP Connection
app.post('/api/test-crm-smtp', async (req, res) => {
  try {
    const { senderEmail, senderName, customPassword, targetEmail } = req.body || {};
    if (!senderEmail) {
      return res.status(400).json({ error: 'senderEmail is required' });
    }
    const result = await testSmtpConnection({ senderEmail, senderName, customPassword, targetEmail });
    res.json(result);
  } catch (error) {
    console.error('SMTP Test Error:', error);
    res.status(500).json({ error: error.message || 'SMTP Authentication Failed' });
  }
});

// API: Dispatch CRM Campaign Emails
app.post('/api/send-crm-email', async (req, res) => {
  try {
    const { senderEmail, senderName, replyTo, recipients, subject, bodyTemplate, customPassword, centreInfo } = req.body || {};
    
    if (!senderEmail || !recipients || !recipients.length || !subject || !bodyTemplate) {
      return res.status(400).json({ error: 'Missing required parameters (senderEmail, recipients, subject, bodyTemplate)' });
    }

    const outcome = await sendCrmCampaign({
      senderEmail,
      senderName,
      replyTo,
      recipients,
      subject,
      bodyTemplate,
      customPassword,
      centreInfo
    });

    res.json(outcome);
  } catch (error) {
    console.error('CRM Outreach Error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch email campaign' });
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
