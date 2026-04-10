import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * GET /api/resend-test
 *
 * Unauthenticated minimal smoke-test for Resend.
 * Sends a test e-mail to the address given in the `to` query parameter
 * (defaults to the value of EMAIL_FROM / ADMIN_SEED_EMAIL if omitted).
 *
 * Returns a plain-text response with the Resend API result or error so
 * Vercel Function logs are not required to see what went wrong.
 *
 * Example:
 *   GET /api/resend-test?to=you@example.com
 *
 * ⚠️  Remove or add authentication to this endpoint once debugging is done.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const apiKey = process.env.RESEND_API_KEY ?? '';
  const siteDomain = process.env.SITE_DOMAIN ?? 'flussdeslebens.live';
  const fromEmail = process.env.EMAIL_FROM ?? `noreply@${siteDomain}`;
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? fromEmail;
  const to = searchParams.get('to') ?? adminEmail;

  // Surface env-var status before even calling Resend
  const envStatus = {
    RESEND_API_KEY: apiKey ? '✅ gesetzt' : '❌ FEHLT',
    EMAIL_FROM: fromEmail,
    SITE_DOMAIN: siteDomain,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? '❌ FEHLT',
  };

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: 'RESEND_API_KEY ist nicht gesetzt – E-Mail kann nicht gesendet werden.',
        env: envStatus,
      },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: `Der Fluss des Lebens <${fromEmail}>`,
    to,
    subject: `[Resend-Test] ${new Date().toISOString()}`,
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:480px;">
        <h2>✅ Resend-Test</h2>
        <p>Diese E-Mail beweist, dass Resend korrekt konfiguriert ist.</p>
        <table style="font-size:13px;border-collapse:collapse;width:100%;margin-top:12px;">
          ${Object.entries(envStatus)
            .map(
              ([k, v]) =>
                `<tr><td style="padding:4px 8px;font-weight:600;">${k}</td>
                 <td style="padding:4px 8px;">${v}</td></tr>`,
            )
            .join('')}
        </table>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;">Gesendet: ${new Date().toISOString()}</p>
      </div>`,
    text: `Resend-Test erfolgreich. Env: ${JSON.stringify(envStatus)}`,
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error,
        env: envStatus,
        tip: 'Häufige Ursachen: (1) Domain nicht in Resend verifiziert, (2) falscher/abgelaufener API-Key, (3) EMAIL_FROM-Adresse stimmt nicht mit verifizierter Domain überein.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data?.id, sentTo: to, env: envStatus });
}
