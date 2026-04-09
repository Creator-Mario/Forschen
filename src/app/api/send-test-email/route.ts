import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

/**
 * GET /api/send-test-email
 *
 * Admin-only endpoint that sends a test e-mail via the configured SMTP relay.
 * Useful for verifying that SMTP_HOST / SMTP_USER / SMTP_PASS and the
 * MAIL_FROM_* environment variables are set up correctly on Vercel.
 *
 * Example usage (curl):
 *   curl -X GET https://your-domain.vercel.app/api/send-test-email \
 *     -H "Cookie: next-auth.session-token=..."
 */
export async function GET() {
  // Only allow admins to trigger this endpoint.
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 403 });
  }

  const to = process.env.MAIL_REPLY_TO ?? process.env.MAIL_FROM_ADDRESS ?? '';
  if (!to) {
    return NextResponse.json(
      { error: 'Kein Empfänger konfiguriert (MAIL_REPLY_TO fehlt).' },
      { status: 500 },
    );
  }

  const siteDomain = process.env.SITE_DOMAIN ?? 'flussdeslebens.live';

  const ok = await sendEmail({
    to,
    subject: `[Test] SMTP-Verbindung erfolgreich – ${siteDomain}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;">✅ SMTP-Test erfolgreich</h2>
        <p style="color:#374151;line-height:1.6;">
          Diese E-Mail wurde über den SMTP-Relay
          (<code>${process.env.SMTP_HOST ?? 'smtp-relay.brevo.com'}</code>)
          versendet und beweist, dass die Konfiguration korrekt ist.
        </p>
        <table style="font-size:13px;color:#4b5563;border-collapse:collapse;width:100%;margin-top:16px;">
          <tr>
            <td style="padding:4px 8px;font-weight:600;">SMTP_HOST</td>
            <td style="padding:4px 8px;">${process.env.SMTP_HOST ?? '–'}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:4px 8px;font-weight:600;">SMTP_PORT</td>
            <td style="padding:4px 8px;">${process.env.SMTP_PORT ?? '587'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">SMTP_USER</td>
            <td style="padding:4px 8px;">${process.env.SMTP_USER ?? '–'}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:4px 8px;font-weight:600;">MAIL_FROM_ADDRESS</td>
            <td style="padding:4px 8px;">${process.env.MAIL_FROM_ADDRESS ?? '–'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">MAIL_FROM_NAME</td>
            <td style="padding:4px 8px;">${process.env.MAIL_FROM_NAME ?? '–'}</td>
          </tr>
        </table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
          Gesendet von ${siteDomain} · ${new Date().toISOString()}
        </p>
      </div>
    `,
    text: `SMTP-Test erfolgreich. Host: ${process.env.SMTP_HOST ?? '–'}, User: ${process.env.SMTP_USER ?? '–'}, From: ${process.env.MAIL_FROM_ADDRESS ?? '–'}`,
  });

  if (!ok) {
    return NextResponse.json(
      { error: 'Versand fehlgeschlagen – Vercel-Funktionslogs prüfen.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, sentTo: to });
}
