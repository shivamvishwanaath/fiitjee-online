import { verifyCashfreeOrder } from '../server/cashfreeHandler.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const orderId = req.query.orderId || req.query.order_id || req.body?.orderId || req.body?.order_id;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId parameter is required' });
    }

    const verification = await verifyCashfreeOrder(orderId);
    return res.status(200).json(verification);
  } catch (error) {
    console.error('Error verifying Cashfree order:', error);
    return res.status(500).json({ error: error.message || 'Failed to verify payment status' });
  }
}
