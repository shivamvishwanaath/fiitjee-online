import { CENTRES_CONFIG } from '../admin/utils/centreUtils';
import { SupportTicket } from '../types';

/**
 * Automatically dispatches an email alert to the Centre's official inbox
 * whenever a candidate submits a support or grievance ticket.
 */
export async function sendTicketEmailAlertToCentre(ticket: SupportTicket): Promise<boolean> {
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || 'https://fiitjee-cashfree-api.shivam-strive.workers.dev'
  ).replace(/\/$/, '');

  const centreId = ticket.centreId || 'bhubaneswar';
  const centreProfile = CENTRES_CONFIG[centreId] || CENTRES_CONFIG.bhubaneswar;
  const centreEmail = centreProfile.email || `fiitjee.${centreId}@fiitjee.online`;

  const payload = {
    senderEmail: centreEmail,
    senderName: `FIITJEE ${centreProfile.name} Admissions Desk`,
    replyTo: ticket.studentEmail || centreEmail,
    recipients: [
      {
        email: centreEmail,
        studentName: ticket.studentName,
        rollNo: ticket.rollNo || 'Not Registered',
        testDate: 'Upcoming Test',
        testMode: 'Offline',
        selectedCenter: centreProfile.name
      }
    ],
    subject: `🚨 [STUDENT GRIEVANCE] ${ticket.category.toUpperCase()}: ${ticket.subject} — ${ticket.studentName}`,
    bodyTemplate: `Attention FIITJEE ${centreProfile.name} Admissions Desk,

A new candidate inquiry / support grievance has been submitted on the FIITJEE Online Portal:

STUDENT PARTICULARS:
• Student Name: ${ticket.studentName}
• Registered Mobile: ${ticket.studentPhone}
• Email Address: ${ticket.studentEmail}
• Roll Number: ${ticket.rollNo || 'Pending / Pre-admission'}
• Submission Time: ${new Date(ticket.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

ISSUE PARTICULARS:
• Ticket ID: ${ticket.ticketId}
• Category: ${ticket.category}
• Subject: ${ticket.subject}

STUDENT MESSAGE:
"${ticket.description}"

ADMIN ACTION REQUIRED:
Please log in to your Centre Operations Portal to reply to this student and update ticket status:
👉 https://fiitjee.online/admin/tickets

Note: Any reply composed in the Admin Portal will be instantly accessible by the candidate on their Student Dashboard.`,
    centreInfo: {
      name: centreProfile.name,
      address: centreProfile.address,
      phone: centreProfile.phoneNumbers?.[0] || centreProfile.helplinePhone
    }
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/send-crm-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not dispatch ticket alert email to centre:', err);
    return false;
  }
}
