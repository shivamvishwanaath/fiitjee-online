import https from 'node:https';

function getConfig() {
  const appId = process.env.CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
  const hostname = process.env.CASHFREE_ENV === 'sandbox' ? 'sandbox.cashfree.com' : 'api.cashfree.com';
  return { appId, secretKey, apiVersion, hostname };
}

function httpsRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, body: { raw: data } });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Creates an order in Cashfree and returns the payment_session_id for Cashfree JS Checkout
 */
export async function createCashfreeOrder({
  orderAmount,
  studentName,
  customerName,
  studentEmail,
  customerEmail,
  studentPhone,
  customerPhone,
  orderId,
  returnUrl
}) {
  const config = getConfig();
  const generatedOrderId = orderId || `ORD_BBET_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Format phone to 10 digits
  const phoneInput = studentPhone || customerPhone || '9999999999';
  const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10) || '9999999999';
  const emailInput = studentEmail || customerEmail;
  const cleanEmail = emailInput && emailInput.includes('@') ? emailInput : 'admissions@fiitjee.online';
  const nameInput = studentName || customerName;
  const cleanName = nameInput && nameInput.trim() ? nameInput.trim() : 'Candidate';

  // Ensure return_url always starts with https:// (enforced by Cashfree PG API)
  let cleanReturnUrl = returnUrl;
  if (!cleanReturnUrl || !cleanReturnUrl.startsWith('https://')) {
    cleanReturnUrl = `https://fiitjee.online/student/dashboard?order_id=${generatedOrderId}`;
  }

  const payload = JSON.stringify({
    order_id: generatedOrderId,
    order_amount: Math.max(1, Number(orderAmount.toFixed(2))),
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${cleanPhone}_${Date.now().toString().slice(-4)}`,
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone
    },
    order_meta: {
      return_url: cleanReturnUrl,
      notify_url: null,
      payment_methods: null
    },
    order_note: `Big Bang Edge Test 2026 - ${cleanName}`
  });

  const response = await httpsRequest({
    hostname: config.hostname,
    path: '/pg/orders',
    method: 'POST',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, payload);

  if (response.status >= 200 && response.status < 300 && response.body.payment_session_id) {
    return {
      success: true,
      order_id: response.body.order_id,
      cf_order_id: response.body.cf_order_id,
      payment_session_id: response.body.payment_session_id,
      order_status: response.body.order_status,
      order_amount: response.body.order_amount
    };
  }

  throw new Error(response.body.message || `Cashfree API returned HTTP ${response.status}`);
}

/**
 * Verifies payment status of an order on Cashfree
 */
export async function verifyCashfreeOrder(orderId) {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const config = getConfig();

  // 1. Fetch Order details
  const orderRes = await httpsRequest({
    hostname: config.hostname,
    path: `/pg/orders/${encodeURIComponent(orderId)}`,
    method: 'GET',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion
    }
  });

  // 2. Fetch Order payments
  const paymentsRes = await httpsRequest({
    hostname: config.hostname,
    path: `/pg/orders/${encodeURIComponent(orderId)}/payments`,
    method: 'GET',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion
    }
  });

  const orderData = orderRes.body;
  const paymentsData = Array.isArray(paymentsRes.body) ? paymentsRes.body : [];

  const successfulPayment = paymentsData.find(p => p.payment_status === 'SUCCESS');
  const isPaid = orderData.order_status === 'PAID' || !!successfulPayment;

  return {
    success: true,
    orderId,
    orderStatus: orderData.order_status,
    isPaid,
    paymentId: successfulPayment ? (successfulPayment.cf_payment_id ? String(successfulPayment.cf_payment_id) : successfulPayment.payment_group) : undefined,
    paymentAmount: successfulPayment?.payment_amount || orderData.order_amount,
    paymentMethod: successfulPayment?.payment_group || 'UPI/Card',
    paymentTime: successfulPayment?.payment_completion_time || new Date().toISOString()
  };
}
