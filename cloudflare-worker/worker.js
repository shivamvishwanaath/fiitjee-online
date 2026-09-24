/**
 * Cloudflare Worker for FIITJEE / TRANSED LLP Cashfree Payment Gateway
 * Handles order creation, verification, and CORS for Firebase Hosting frontend
 */

const CASHFREE_HOSTNAME = 'api.cashfree.com';
const API_VERSION = '2023-08-01';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-id',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    const APP_ID = env.CASHFREE_APP_ID || '';
    const SECRET_KEY = env.CASHFREE_SECRET_KEY || '';

    // Health check
    if (path === '/api/health' || path === '/health') {
      return jsonResponse({
        status: 'ok',
        gateway: 'Cashfree',
        entity: 'TRANSED LLP',
        timestamp: new Date().toISOString(),
      });
    }

    // 1. Create Cashfree Order
    if (path.endsWith('/api/create-cashfree-order') && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const {
          orderAmount,
          studentName,
          customerName,
          studentEmail,
          customerEmail,
          studentPhone,
          customerPhone,
          orderId,
          order_id,
          returnUrl,
        } = body;

        if (!orderAmount || Number(orderAmount) <= 0) {
          return jsonResponse({ error: 'Valid order amount is required' }, 400);
        }

        const generatedOrderId = orderId || order_id || `ORD_BBET_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const phoneInput = studentPhone || customerPhone || '9999999999';
        const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10) || '9999999999';
        const emailInput = studentEmail || customerEmail;
        const cleanEmail = emailInput && emailInput.includes('@') ? emailInput : 'admissions@fiitjee.online';
        const nameInput = studentName || customerName;
        const cleanName = nameInput && nameInput.trim() ? nameInput.trim() : 'Candidate';

        let cleanReturnUrl = returnUrl;
        if (!cleanReturnUrl || !cleanReturnUrl.startsWith('https://')) {
          cleanReturnUrl = `https://fiitjee.online/student/dashboard?order_id=${generatedOrderId}`;
        }

        const cfPayload = {
          order_id: generatedOrderId,
          order_amount: Math.max(1, Number(Number(orderAmount).toFixed(2))),
          order_currency: 'INR',
          customer_details: {
            customer_id: `cust_${cleanPhone}_${Date.now().toString().slice(-4)}`,
            customer_name: cleanName,
            customer_email: cleanEmail,
            customer_phone: cleanPhone,
          },
          order_meta: {
            return_url: cleanReturnUrl,
            notify_url: null,
            payment_methods: null,
          },
          order_note: `Big Bang Edge Test 2026 - ${cleanName}`,
        };

        const cfRes = await fetch(`https://${CASHFREE_HOSTNAME}/pg/orders`, {
          method: 'POST',
          headers: {
            'x-client-id': APP_ID,
            'x-client-secret': SECRET_KEY,
            'x-api-version': API_VERSION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cfPayload),
        });

        const cfData = await cfRes.json();

        if (cfRes.ok && cfData.payment_session_id) {
          return jsonResponse({
            success: true,
            order_id: cfData.order_id,
            cf_order_id: cfData.cf_order_id,
            payment_session_id: cfData.payment_session_id,
            order_status: cfData.order_status,
            order_amount: cfData.order_amount,
          });
        }

        return jsonResponse(
          { error: cfData.message || `Cashfree error HTTP ${cfRes.status}` },
          cfRes.status || 500
        );
      } catch (err) {
        return jsonResponse({ error: err.message || 'Failed to create order' }, 500);
      }
    }

    // 2. Verify Cashfree Order
    if (path.endsWith('/api/verify-cashfree-order')) {
      try {
        let orderId = url.searchParams.get('orderId') || url.searchParams.get('order_id');
        if (!orderId && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          orderId = body.orderId || body.order_id;
        }

        if (!orderId) {
          return jsonResponse({ error: 'orderId parameter is required' }, 400);
        }

        // Fetch Order details & payments from Cashfree
        const [orderRes, paymentsRes] = await Promise.all([
          fetch(`https://${CASHFREE_HOSTNAME}/pg/orders/${encodeURIComponent(orderId)}`, {
            headers: {
              'x-client-id': APP_ID,
              'x-client-secret': SECRET_KEY,
              'x-api-version': API_VERSION,
            },
          }),
          fetch(`https://${CASHFREE_HOSTNAME}/pg/orders/${encodeURIComponent(orderId)}/payments`, {
            headers: {
              'x-client-id': APP_ID,
              'x-client-secret': SECRET_KEY,
              'x-api-version': API_VERSION,
            },
          }),
        ]);

        const orderData = await orderRes.json().catch(() => ({}));
        const paymentsData = await paymentsRes.json().catch(() => []);
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];

        const successfulPayment = paymentsList.find((p) => p.payment_status === 'SUCCESS');
        const isPaid = orderData.order_status === 'PAID' || !!successfulPayment;

        return jsonResponse({
          success: true,
          orderId,
          orderStatus: orderData.order_status,
          isPaid,
          paymentId: successfulPayment
            ? successfulPayment.cf_payment_id
              ? String(successfulPayment.cf_payment_id)
              : successfulPayment.payment_group
            : undefined,
          paymentAmount: successfulPayment?.payment_amount || orderData.order_amount,
          paymentMethod: successfulPayment?.payment_group || 'UPI/Card',
          paymentTime: successfulPayment?.payment_completion_time || new Date().toISOString(),
        });
      } catch (err) {
        return jsonResponse({ error: err.message || 'Failed to verify order' }, 500);
      }
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  },
};
