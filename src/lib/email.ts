import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(
  toEmail: string,
  token: string,
  baseUrl: string,
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'E-Mail-Adresse bestätigen – Forschen',
      text: `Bitte bestätige deine E-Mail-Adresse, indem du diesen Link öffnest:\n\n${verifyUrl}\n\nFalls du dich nicht registriert hast, ignoriere diese Nachricht.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#1e3a8a;margin-bottom:16px;">E-Mail-Adresse bestätigen</h2>
          <p style="color:#374151;line-height:1.6;">
            Vielen Dank für deine Registrierung! Klicke auf den folgenden Button,
            um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren.
          </p>
          <a href="${verifyUrl}"
             style="display:inline-block;margin:24px 0;background:#1e40af;color:#fff;
                    text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
            E-Mail bestätigen
          </a>
          <p style="color:#6b7280;font-size:13px;">
            Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
            <a href="${verifyUrl}" style="color:#2563eb;">${verifyUrl}</a>
          </p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            Falls du dich nicht registriert hast, ignoriere diese Nachricht.
          </p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}
