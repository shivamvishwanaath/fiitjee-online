import nodemailer from 'nodemailer';

const DEFAULT_PASSWORDS = {
  'fiitjee.dwarka@fiitjee.online': process.env.SMTP_PASS_DWARKA || 'Fiitjee@dwarka2026!',
  'fiitjee.bhubaneswar@fiitjee.online': process.env.SMTP_PASS_BHUBANESWAR || 'password123',
  'fiitjee.ranchi@fiitjee.online': process.env.SMTP_PASS_RANCHI || 'password123',
  'fiitjee.hyderabad@fiitjee.online': process.env.SMTP_PASS_HYDERABAD || 'password123'
};

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.fiitjee.online';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);

/**
 * Creates an authenticated Nodemailer transporter for the sender email
 */
export function createCentreTransporter(senderEmail, customPassword = '') {
  const cleanEmail = (senderEmail || '').trim().toLowerCase();
  const password = customPassword || DEFAULT_PASSWORDS[cleanEmail] || process.env.SMTP_DEFAULT_PASS || 'password123';

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: cleanEmail,
      pass: password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Test SMTP connection and dispatch verification test email
 */
export async function testSmtpConnection({ senderEmail, senderName, customPassword, targetEmail }) {
  const cleanEmail = (senderEmail || '').trim().toLowerCase();
  const transporter = createCentreTransporter(cleanEmail, customPassword);

  // 1. Verify credentials
  await transporter.verify();

  // 2. If targetEmail is provided, send a sample verification email
  if (targetEmail) {
    const info = await transporter.sendMail({
      from: `"${senderName || 'FIITJEE Admissions'}" <${cleanEmail}>`,
      to: targetEmail,
      replyTo: cleanEmail,
      subject: `FIITJEE Outreach System Verification — ${senderName || cleanEmail}`,
      text: `Hello,\n\nThis is an automated verification email confirming that ${cleanEmail} is authenticated with smtp.fiitjee.online and ready to dispatch student outreach campaigns.\n\nDispatched: ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #002147; padding: 20px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 18px; color: #ffffff;">FIITJEE Email Outreach Gateway</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #fbbf24;">Live Sender Verification</p>
          </div>
          <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Hello,</p>
            <p>Your centre mailbox <strong>${cleanEmail}</strong> has been successfully authenticated with the FIITJEE mail server (<code>smtp.fiitjee.online</code>).</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #ED1C24; padding: 12px 16px; margin: 16px 0; font-size: 13px;">
              <div><strong>Authenticated Sender:</strong> ${cleanEmail}</div>
              <div><strong>Recipient:</strong> ${targetEmail}</div>
              <div><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">CONNECTED & OPERATIONAL</span></div>
              <div><strong>Dispatched At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
            </div>
            <p style="font-size: 12px; color: #64748b;">Direct student broadcasts will now be delivered with this sender address, and all replies will route to this inbox.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 11px; color: #64748b;">
            &copy; 2026 TRANSED LLP &bull; FIITJEE Admissions Directorate
          </div>
        </div>
      `
    });
    return { success: true, verified: true, messageId: info.messageId };
  }

  return { success: true, verified: true };
}

/**
 * Dispatch personalized CRM campaign emails to candidate recipients
 */
export async function sendCrmCampaign({
  senderEmail,
  senderName,
  replyTo,
  recipients,
  subject,
  bodyTemplate,
  customPassword,
  centreInfo = {}
}) {
  const cleanSenderEmail = (senderEmail || '').trim().toLowerCase();
  if (!cleanSenderEmail) {
    throw new Error('Sender email address is required');
  }

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('No recipients provided for outreach campaign');
  }

  const transporter = createCentreTransporter(cleanSenderEmail, customPassword);
  await transporter.verify();

  const results = [];

  for (const rec of recipients) {
    const candidateEmail = (rec.email || '').trim();
    if (!candidateEmail) continue;

    // Merge template variables
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

    // Generate formatted HTML
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
          <div>Desk Email: <a href="mailto:${cleanSenderEmail}" style="color: #ED1C24; text-decoration: none;">${cleanSenderEmail}</a></div>
          ${centreInfo.phone ? `<div>Helpline: <strong>${centreInfo.phone}</strong></div>` : ''}
          <div style="margin-top: 12px; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1; pt: 8px;">
            &copy; 2026 TRANSED LLP. All rights reserved. Registered under FIITJEE Admissions Operations.
          </div>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"${senderName || 'FIITJEE Admissions'}" <${cleanSenderEmail}>`,
        to: candidateEmail,
        replyTo: replyTo || cleanSenderEmail,
        subject: personalizedSubject,
        text: personalizedBody,
        html: formattedHtml
      });

      results.push({
        email: candidateEmail,
        studentName: rec.studentName || rec.name,
        success: true,
        messageId: info.messageId
      });
    } catch (sendErr) {
      console.error(`Failed to send email to ${candidateEmail}:`, sendErr);
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

  return {
    success: true,
    sentCount,
    failedCount,
    totalCount: recipients.length,
    results
  };
}
