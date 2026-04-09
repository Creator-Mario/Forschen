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

const FROM = () => process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@forschen.de';

export async function sendVerificationEmail(
  toEmail: string,
  token: string,
  baseUrl: string,
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }

  const from = FROM();
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

export async function sendAdminMessageEmail(
  toEmail: string,
  userName: string,
  contentType: string,
  adminMessage: string,
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: FROM(),
      to: toEmail,
      subject: 'Rückfrage des Admins zu deinem Beitrag – Forschen',
      text: `Hallo ${userName},\n\nder Administrator hat eine Rückfrage zu deinem Beitrag (${contentType}):\n\n"${adminMessage}"\n\nBitte melde dich in deinem Dashboard, um zu antworten.\n\nDer Fluss des Lebens`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#1e3a8a;margin-bottom:16px;">Rückfrage zu deinem Beitrag</h2>
          <p style="color:#374151;line-height:1.6;">Hallo ${userName},</p>
          <p style="color:#374151;line-height:1.6;">
            Der Administrator hat eine Rückfrage zu deinem <strong>${contentType}</strong>:
          </p>
          <blockquote style="border-left:4px solid #f97316;padding:12px 16px;margin:16px 0;background:#fff7ed;color:#374151;border-radius:0 8px 8px 0;">
            ${adminMessage}
          </blockquote>
          <p style="color:#374151;line-height:1.6;">
            Bitte melde dich in deinem <a href="${process.env.NEXTAUTH_URL || ''}/dashboard" style="color:#2563eb;">Dashboard</a> an, um die Rückfrage einzusehen und zu reagieren.
          </p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Der Fluss des Lebens</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendAdminApprovalEmail(
  toEmail: string,
  userName: string,
  approved: boolean,
  note?: string,
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const subject = approved
    ? 'Dein Konto wurde freigeschaltet – Forschen'
    : 'Rückfrage zu deiner Anmeldung – Forschen';

  const bodyText = approved
    ? `Hallo ${userName},\n\nDein Konto bei „Der Fluss des Lebens" wurde freigeschaltet. Du kannst dich jetzt einloggen.\n\n${note ? `Notiz des Admins: ${note}\n\n` : ''}Herzlich willkommen!`
    : `Hallo ${userName},\n\nDer Administrator hat eine Rückfrage zu deiner Anmeldung:\n\n"${note}"\n\nBitte melde dich in deinem Dashboard.`;

  try {
    await transporter.sendMail({
      from: FROM(),
      to: toEmail,
      subject,
      text: bodyText,
    });
    return true;
  } catch {
    return false;
  }
}
