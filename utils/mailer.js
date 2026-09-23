// Sends transactional email via Resend's REST API (https://resend.com).
// If RESEND_API_KEY isn't set, logs the email to the console instead of
// sending it — so signup/verification still works end-to-end locally, or
// before Resend is configured, same graceful-degradation pattern as db.js.

async function sendMail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'Deegansan <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('[mailer] RESEND_API_KEY is not set — logging email instead of sending it.');
    console.log(`[mailer] To: ${to}\n[mailer] Subject: ${subject}\n[mailer] Body:\n${html}`);
    return { delivered: false };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[mailer] Resend request failed:', response.status, detail);
    throw new Error('Failed to send email.');
  }

  return { delivered: true };
}

module.exports = { sendMail };
