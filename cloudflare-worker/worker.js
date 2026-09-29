/**
 * Cloudflare Worker for FIITJEE / TRANSED LLP
 * - Cashfree Payment Gateway (Orders, Verification, CORS)
 * - Serverbyt SMTP Mail Outreach Gateway (Native SMTPS via cloudflare:sockets)
 */

import { connect } from 'cloudflare:sockets';

const CASHFREE_HOSTNAME = 'api.cashfree.com';
const API_VERSION = '2023-08-01';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-id, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

function getCentrePassword(cleanSender, env) {
  if (!cleanSender || !env) return env?.SMTP_DEFAULT_PASS || '';
  const domainPrefix = cleanSender.split('@')[0] || '';
  const branchKey = domainPrefix.replace(/^fiitjee\./i, '').toUpperCase();
  const secretKey = `ADMIN_PASS_${branchKey}`;
  if (env[secretKey]) return env[secretKey];
  const fullKey = `SMTP_PASS_${cleanSender.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
  if (env[fullKey]) return env[fullKey];
  if (env.DEFAULT_PASSWORDS) {
    try {
      const parsed = typeof env.DEFAULT_PASSWORDS === 'string' ? JSON.parse(env.DEFAULT_PASSWORDS) : env.DEFAULT_PASSWORDS;
      if (parsed && parsed[cleanSender]) return parsed[cleanSender];
    } catch {}
  }
  return env.SMTP_DEFAULT_PASS || '';
}

function isAuthorizedRequest(request, env) {
  if (!env || !env.API_SECRET_KEY) return true; // Optional during transition
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === env.API_SECRET_KEY;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

function encodeUtf8Base64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function encodeSubjectHeader(str) {
  if (!str) return '';
  if (/^[\x20-\x7E]*$/.test(str)) {
    return str;
  }
  return `=?UTF-8?B?${encodeUtf8Base64(str)}?=`;
}

/**
 * Direct SMTPS sender over cloudflare:sockets (Port 465 SSL)
 */
async function sendSmtpEmailOverSocket({
  host = 'smtp.fiitjee.online',
  port = 465,
  user,
  pass,
  fromName,
  to,
  replyTo,
  subject,
  html,
  text
}) {
  const socket = connect({ hostname: host, port }, { secureTransport: 'on' });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = '';

  async function readLine() {
    while (true) {
      const idx = buffer.indexOf('\n');
      if (idx !== -1) {
        const line = buffer.slice(0, idx).replace(/\r$/, '');
        buffer = buffer.slice(idx + 1);
        return line;
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('SMTP connection closed unexpectedly');
      buffer += decoder.decode(value, { stream: true });
    }
  }

  async function readReply() {
    let code = 0;
    let textReply = '';
    while (true) {
      const line = await readLine();
      code = parseInt(line.slice(0, 3), 10);
      textReply += line + '\n';
      if (line.length >= 4 && line[3] === ' ') {
        break;
      }
      if (line.length === 3) {
        break;
      }
    }
    return { code, text: textReply.trim() };
  }

  async function sendCmd(cmd) {
    await writer.write(encoder.encode(cmd + '\r\n'));
    return await readReply();
  }

  try {
    // 1. Initial Greeting
    const greeting = await readReply();
    if (greeting.code !== 220) {
      throw new Error(`SMTP Greeting failed: ${greeting.text}`);
    }

    // 2. EHLO
    const ehlo = await sendCmd('EHLO fiitjee.online');
    if (ehlo.code !== 250) {
      throw new Error(`EHLO command rejected: ${ehlo.text}`);
    }

    // 3. AUTH LOGIN
    const authPrompt = await sendCmd('AUTH LOGIN');
    if (authPrompt.code !== 334) {
      throw new Error(`AUTH LOGIN rejected: ${authPrompt.text}`);
    }

    // Username
    const userPrompt = await sendCmd(btoa(user));
    if (userPrompt.code !== 334) {
      throw new Error(`Username rejected: ${userPrompt.text}`);
    }

    // Password
    const passPrompt = await sendCmd(btoa(pass));
    if (passPrompt.code !== 235) {
      throw new Error(`Authentication failed: ${passPrompt.text}`);
    }

    // 4. MAIL FROM
    const mailFrom = await sendCmd(`MAIL FROM:<${user}>`);
    if (mailFrom.code !== 250) {
      throw new Error(`MAIL FROM rejected: ${mailFrom.text}`);
    }

    // 5. RCPT TO
    const rcptTo = await sendCmd(`RCPT TO:<${to}>`);
    if (rcptTo.code !== 250 && rcptTo.code !== 251) {
      throw new Error(`RCPT TO rejected: ${rcptTo.text}`);
    }

    // 6. DATA
    const dataPrompt = await sendCmd('DATA');
    if (dataPrompt.code !== 354) {
      throw new Error(`DATA prompt rejected: ${dataPrompt.text}`);
    }

    // Build MIME message
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@fiitjee.online>`;
    const dateHeader = new Date().toUTCString();

    const senderHeader = fromName
      ? `"${encodeSubjectHeader(fromName)}" <${user}>`
      : `<${user}>`;

    let mime = '';
    mime += `From: ${senderHeader}\r\n`;
    mime += `To: <${to}>\r\n`;
    if (replyTo) {
      mime += `Reply-To: <${replyTo}>\r\n`;
    }
    mime += `Subject: ${encodeSubjectHeader(subject)}\r\n`;
    mime += `Date: ${dateHeader}\r\n`;
    mime += `Message-ID: ${messageId}\r\n`;
    mime += `MIME-Version: 1.0\r\n`;
    mime += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;
    mime += `\r\n`;

    // Text part
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: text/plain; charset=UTF-8\r\n`;
    mime += `Content-Transfer-Encoding: base64\r\n\r\n`;
    mime += `${encodeUtf8Base64(text || '')}\r\n\r\n`;

    // HTML part
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: text/html; charset=UTF-8\r\n`;
    mime += `Content-Transfer-Encoding: base64\r\n\r\n`;
    mime += `${encodeUtf8Base64(html || '')}\r\n\r\n`;

    mime += `--${boundary}--\r\n`;
    mime += `.\r\n`;

    await writer.write(encoder.encode(mime));
    const dataResp = await readReply();
    if (dataResp.code !== 250) {
      throw new Error(`Failed to transmit message data: ${dataResp.text}`);
    }

    // 7. QUIT
    try {
      await sendCmd('QUIT');
    } catch (_) {}

    return { success: true, messageId };
  } finally {
    try {
      writer.releaseLock();
    } catch (_) {}
    try {
      reader.releaseLock();
    } catch (_) {}
    try {
      await socket.close();
    } catch (_) {}
  }
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
        gateway: 'Cashfree & Serverbyt SMTP',
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

    // 3. Test Centre SMTP Connection
    if (path.endsWith('/api/test-crm-smtp') && request.method === 'POST') {
      try {
        if (!isAuthorizedRequest(request, env)) {
          return jsonResponse({ error: 'Unauthorized request: Invalid or missing API Key' }, 401);
        }

        const body = await request.json().catch(() => ({}));
        const { senderEmail, senderName, customPassword, targetEmail } = body;

        const cleanSender = (senderEmail || '').trim().toLowerCase();
        if (!cleanSender) {
          return jsonResponse({ error: 'senderEmail is required' }, 400);
        }

        const pass = customPassword || getCentrePassword(cleanSender, env);
        const target = (targetEmail || cleanSender).trim();

        const result = await sendSmtpEmailOverSocket({
          host: env.SMTP_HOST || 'smtp.fiitjee.online',
          port: parseInt(env.SMTP_PORT || '465', 10),
          user: cleanSender,
          pass,
          fromName: senderName || 'FIITJEE Admissions',
          to: target,
          replyTo: cleanSender,
          subject: `FIITJEE Outreach Gateway Verification — ${senderName || cleanSender}`,
          text: `Hello,\n\nThis is an automated verification email confirming that ${cleanSender} is authenticated with Serverbyt SMTP and ready to dispatch student outreach campaigns.\n\nDispatched: ${new Date().toISOString()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
              <div style="background-color: #002147; padding: 20px; color: #ffffff;">
                <h2 style="margin: 0; font-size: 18px; color: #ffffff;">FIITJEE Email Outreach Gateway</h2>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #fbbf24;">Live Cloudflare Edge Sender Verification</p>
              </div>
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p>Hello,</p>
                <p>Your centre mailbox <strong>${cleanSender}</strong> has been successfully authenticated with the Serverbyt mail server (<code>smtp.fiitjee.online:465 SSL</code>).</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #ED1C24; padding: 12px 16px; margin: 16px 0; font-size: 13px;">
                  <div><strong>Authenticated Sender:</strong> ${cleanSender}</div>
                  <div><strong>Recipient:</strong> ${target}</div>
                  <div><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">CONNECTED & OPERATIONAL</span></div>
                  <div><strong>Dispatched:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
                </div>
                <p style="font-size: 12px; color: #64748b;">Direct student broadcasts are active. All candidate replies route directly to your official centre inbox.</p>
              </div>
              <div style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 11px; color: #64748b;">
                &copy; 2026 TRANSED LLP &bull; FIITJEE Admissions Directorate
              </div>
            </div>
          `
        });

        return jsonResponse(result);
      } catch (err) {
        return jsonResponse({ error: err.message || 'SMTP Authentication Failed' }, 500);
      }
    }

    // 4. Dispatch CRM Campaign Emails
    if (path.endsWith('/api/send-crm-email') && request.method === 'POST') {
      try {
        if (!isAuthorizedRequest(request, env)) {
          return jsonResponse({ error: 'Unauthorized request: Invalid or missing API Key' }, 401);
        }

        const body = await request.json().catch(() => ({}));
        const {
          senderEmail,
          senderName,
          replyTo,
          recipients,
          subject,
          bodyTemplate,
          customPassword,
          centreInfo = {}
        } = body;

        const cleanSender = (senderEmail || '').trim().toLowerCase();
        if (!cleanSender || !recipients || !recipients.length || !subject || !bodyTemplate) {
          return jsonResponse({ error: 'Missing required parameters (senderEmail, recipients, subject, bodyTemplate)' }, 400);
        }

        const pass = customPassword || getCentrePassword(cleanSender, env);
        const host = env.SMTP_HOST || 'smtp.fiitjee.online';
        const port = parseInt(env.SMTP_PORT || '465', 10);

        const results = [];

        for (const rec of recipients) {
          const candidateEmail = (rec.email || '').trim();
          if (!candidateEmail) continue;

          // Merge variables
          const vars = {
            '{{studentName}}': rec.studentName || rec.name || 'Student',
            '{{rollNo}}': rec.rollNo || 'Pending',
            '{{testDate}}': rec.testDate || '11th October 2026 (Sunday)',
            '{{testMode}}': rec.testMode || 'Offline',
            '{{centreName}}': centreInfo.name || rec.selectedCenter || 'FIITJEE Centre',
            '{{centreAddress}}': centreInfo.address || rec.address || 'FIITJEE Admissions Centre',
            '{{centrePhone}}': centreInfo.phone || '85272 08022'
          };

          let personalizedSubject = subject;
          let personalizedBody = bodyTemplate;

          Object.entries(vars).forEach(([k, v]) => {
            personalizedSubject = personalizedSubject.replace(new RegExp(k, 'g'), v);
            personalizedBody = personalizedBody.replace(new RegExp(k, 'g'), v);
          });

          const formattedHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background-color: #002147; padding: 20px 24px; border-bottom: 3px solid #ED1C24;">
                <h2 style="margin: 0; font-size: 18px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                  FIITJEE ${centreInfo.name || 'Admissions'}
                </h2>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">
                  Candidate Admissions Communication &bull; 2026
                </p>
              </div>

              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${personalizedBody}
              </div>

              <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b;">
                <div style="font-weight: bold; color: #002147; margin-bottom: 4px;">Direct Center Enquiries:</div>
                <div>FIITJEE ${centreInfo.name || 'Admissions Centre'}</div>
                <div>Desk Email: <a href="mailto:${cleanSender}" style="color: #ED1C24; text-decoration: none;">${cleanSender}</a></div>
                ${centreInfo.phone ? `<div>Helpline: <strong>${centreInfo.phone}</strong></div>` : ''}
                <div style="margin-top: 12px; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1; pt: 8px;">
                  &copy; 2026 TRANSED LLP. All rights reserved. Registered under FIITJEE Admissions Operations.
                </div>
              </div>
            </div>
          `;

          try {
            const sendRes = await sendSmtpEmailOverSocket({
              host,
              port,
              user: cleanSender,
              pass,
              fromName: senderName || `FIITJEE ${centreInfo.name || 'Admissions'} Centre`,
              to: candidateEmail,
              replyTo: replyTo || cleanSender,
              subject: personalizedSubject,
              text: personalizedBody,
              html: formattedHtml
            });

            results.push({
              email: candidateEmail,
              studentName: rec.studentName || rec.name,
              success: true,
              messageId: sendRes.messageId
            });
          } catch (sendErr) {
            results.push({
              email: candidateEmail,
              studentName: rec.studentName || rec.name,
              success: false,
              error: sendErr.message
            });
          }
        }

        const sentCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        return jsonResponse({
          success: true,
          sentCount,
          failedCount,
          totalCount: recipients.length,
          results
        });
      } catch (err) {
        return jsonResponse({ error: err.message || 'Failed to dispatch email campaign' }, 500);
      }
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  },
};
