import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { emailFromAddress, siteDomain, canonicalSiteUrl } from '@/lib/config';

/**
 * GET /api/send-test-email
 *
 * Admin-only endpoint that sends a test e-mail via Resend.
 * Useful for verifying that RESEND_API_KEY and EMAIL_FROM are set up
 * correctly on Vercel.
 *
 * The test e-mail is sent to the currently logged-in admin's address.
 *
 * Example usage (curl):
 *   curl -X GET https://flussdeslebens.live/api/send-test-email \
 *     -H "Cookie: next-auth.session-token=..."
 */
export async function GET() {
  // Only allow admins to trigger this endpoint.
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 403 });
  }

  const to = session.user.email;
  const ok = await sendEmail({
    to,
    subject: `[Test] Resend-Verbindung erfolgreich – ${siteDomain}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;">✅ Resend-Test erfolgreich</h2>
        <p style="color:#374151;line-height:1.6;">
          Diese E-Mail wurde über <strong>Resend</strong> versendet und beweist,
          dass die Konfiguration korrekt ist.
        </p>
        <table style="font-size:13px;color:#4b5563;border-collapse:collapse;width:100%;margin-top:16px;">
          <tr>
            <td style="padding:4px 8px;font-weight:600;">RESEND_API_KEY</td>
            <td style="padding:4px 8px;">${process.env.RESEND_API_KEY ? '✅ gesetzt' : '❌ fehlt'}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:4px 8px;font-weight:600;">EMAIL_FROM</td>
            <td style="padding:4px 8px;">${emailFromAddress}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">SITE_DOMAIN</td>
            <td style="padding:4px 8px;">${siteDomain}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:4px 8px;font-weight:600;">MAIL_LINK_BASE</td>
            <td style="padding:4px 8px;">${canonicalSiteUrl}</td>
          </tr>
        </table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
          Gesendet von ${siteDomain} · ${new Date().toISOString()}
        </p>
      </div>
    `,
    text: `Resend-Test erfolgreich. From: ${emailFromAddress}, Domain: ${siteDomain}, Mail-Link-Basis: ${canonicalSiteUrl}, RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'gesetzt' : 'fehlt'}`,
  });

  if (!ok) {
    return NextResponse.json(
      { error: 'Versand fehlgeschlagen – Vercel-Funktionslogs prüfen.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, sentTo: to });
}
