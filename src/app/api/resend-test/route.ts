import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { siteName as SITE_NAME } from '@/lib/config';

const TEST_RECIPIENT = process.env.RESEND_TEST_EMAIL ?? process.env.EMAIL_FROM ?? 'delivered@resend.dev';

export async function GET() {
  console.log('[resend-test] Sending test email to', TEST_RECIPIENT);

  const result = await sendEmail({
    to: TEST_RECIPIENT,
    subject: `Resend-Test – ${SITE_NAME}`,
    text: 'Dies ist eine Test-E-Mail, um zu prüfen, ob Resend korrekt konfiguriert ist.',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;">Resend-Test ✓</h2>
        <p style="color:#374151;">Diese Test-E-Mail bestätigt, dass Resend korrekt konfiguriert ist.</p>
        <p style="color:#6b7280;font-size:13px;">NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ?? '(nicht gesetzt)'}</p>
      </div>
    `,
  });

  if (result) {
    return NextResponse.json({ success: true, sentTo: TEST_RECIPIENT });
  }
  return NextResponse.json({ success: false, sentTo: TEST_RECIPIENT }, { status: 500 });
}
