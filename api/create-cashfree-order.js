import { createCashfreeOrder } from '../server/cashfreeHandler.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    return res.status(200).json(orderData);
  } catch (error) {
    console.error('Error creating Cashfree order:', error);
    return res.status(500).json({ error: error.message || 'Failed to create payment session' });
  }
}
