import { Resend } from 'resend';
import { siteName as SITE_NAME, siteDomain as SITE_DOMAIN } from '@/lib/config';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('[email] RESEND_API_KEY is not configured.');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM_EMAIL = process.env.EMAIL_FROM ?? `noreply@${SITE_DOMAIN}`;

/** Escapes HTML special characters to prevent injection in email templates. */
export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generic send-email helper.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    const { data, error } = await getResend().emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return false;
    }

    console.info('[email] Sent:', subject, '→', to, '| id:', data?.id);
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', subject, '→', to, err);
    return false;
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  token: string,
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${SITE_DOMAIN}`;
  console.log('[sendVerificationEmail] Called with', { toEmail, token: token.slice(0, 8) + '…', baseUrl });
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const result = await sendEmail({
    to: toEmail,
    subject: `E-Mail-Adresse bestätigen – ${SITE_NAME}`,
    text: `Bitte bestätige deine E-Mail-Adresse, indem du diesen Link öffnest:\n\n${verifyUrl}\n\nFalls du dich nicht registriert hast, ignoriere diese Nachricht.\n\n${SITE_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">E-Mail-Adresse bestätigen</h2>
        <p style="color:#374151;line-height:1.6;">
          Vielen Dank für deine Registrierung bei <strong>${SITE_NAME}</strong>!
          Klicke auf den folgenden Button, um deine E-Mail-Adresse zu bestätigen
          und dein Konto zu aktivieren.
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
        <p style="color:#9ca3af;font-size:12px;">${SITE_NAME} · ${SITE_DOMAIN}</p>
      </div>
    `,
  });
  console.log('[sendVerificationEmail] sendEmail result:', result);
  return result;
}

export async function sendAdminMessageEmail(
  toEmail: string,
  userName: string,
  contentType: string,
  adminMessage: string,
): Promise<boolean> {
  const dashboardUrl = `${process.env.NEXTAUTH_URL ?? `https://${SITE_DOMAIN}`}/dashboard`;

  return sendEmail({
    to: toEmail,
    subject: `Rückfrage des Admins zu deinem Beitrag – ${SITE_NAME}`,
    text: `Hallo ${userName},\n\nder Administrator hat eine Rückfrage zu deinem Beitrag (${contentType}):\n\n"${adminMessage}"\n\nBitte melde dich in deinem Dashboard, um zu antworten.\n\n${SITE_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">Rückfrage zu deinem Beitrag</h2>
        <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
        <p style="color:#374151;line-height:1.6;">
          Der Administrator hat eine Rückfrage zu deinem <strong>${escHtml(contentType)}</strong>:
        </p>
        <blockquote style="border-left:4px solid #f97316;padding:12px 16px;margin:16px 0;background:#fff7ed;color:#374151;border-radius:0 8px 8px 0;">
          ${escHtml(adminMessage)}
        </blockquote>
        <p style="color:#374151;line-height:1.6;">
          Bitte melde dich in deinem
          <a href="${dashboardUrl}" style="color:#2563eb;">Dashboard</a>
          an, um die Rückfrage einzusehen und zu reagieren.
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${SITE_NAME} · ${SITE_DOMAIN}</p>
      </div>
    `,
  });
}

export async function sendAdminApprovalEmail(
  toEmail: string,
  userName: string,
  approved: boolean,
  note?: string,
): Promise<boolean> {
  const subject = approved
    ? `Dein Konto wurde freigeschaltet – ${SITE_NAME}`
    : `Rückfrage zu deiner Anmeldung – ${SITE_NAME}`;

  const bodyText = approved
    ? `Hallo ${userName},\n\nDein Konto bei „${SITE_NAME}" wurde freigeschaltet. Du kannst dich jetzt einloggen.\n\n${note ? `Notiz des Admins: ${note}\n\n` : ''}Herzlich willkommen!\n\n${SITE_NAME}`
    : `Hallo ${userName},\n\nDer Administrator hat eine Rückfrage zu deiner Anmeldung:\n\n"${note}"\n\nBitte melde dich in deinem Dashboard.\n\n${SITE_NAME}`;

  const bodyHtml = approved
    ? `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">Dein Konto wurde freigeschaltet 🎉</h2>
        <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
        <p style="color:#374151;line-height:1.6;">
          Dein Konto bei <strong>${SITE_NAME}</strong> wurde freigeschaltet.
          Du kannst dich jetzt einloggen.
        </p>
        ${note ? `<p style="color:#374151;line-height:1.6;font-style:italic;">${escHtml(note)}</p>` : ''}
        <p style="color:#374151;line-height:1.6;">Herzlich willkommen!</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${SITE_NAME} · ${SITE_DOMAIN}</p>
      </div>
    `
    : `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">Rückfrage zu deiner Anmeldung</h2>
        <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
        <p style="color:#374151;line-height:1.6;">
          Der Administrator hat eine Rückfrage zu deiner Anmeldung:
        </p>
        <blockquote style="border-left:4px solid #f97316;padding:12px 16px;margin:16px 0;background:#fff7ed;color:#374151;border-radius:0 8px 8px 0;">
          ${note ? escHtml(note) : ''}
        </blockquote>
        <p style="color:#374151;line-height:1.6;">
          Bitte melde dich in deinem Dashboard, um zu antworten.
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${SITE_NAME} · ${SITE_DOMAIN}</p>
      </div>
    `;

  return sendEmail({
    to: toEmail,
    subject,
    text: bodyText,
    html: bodyHtml,
  });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  token: string,
): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL ?? `https://${SITE_DOMAIN}`}/passwort-zuruecksetzen?token=${token}`;

  return sendEmail({
    to: toEmail,
    subject: `Passwort zurücksetzen – ${SITE_NAME}`,
    text: `Hallo ${userName},\n\ndu hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Öffne diesen Link, um ein neues Passwort zu vergeben:\n\n${resetUrl}\n\nDer Link ist 1 Stunde gültig. Falls du diese Anfrage nicht gestellt hast, ignoriere diese Nachricht.\n\n${SITE_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">Passwort zurücksetzen</h2>
        <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
        <p style="color:#374151;line-height:1.6;">
          Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.
          Klicke auf den folgenden Button, um ein neues Passwort zu vergeben.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;background:#1e40af;color:#fff;
                  text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Passwort zurücksetzen
        </a>
        <p style="color:#6b7280;font-size:13px;">
          Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
          <a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:8px;">
          Der Link ist 1 Stunde gültig.
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
          Falls du diese Anfrage nicht gestellt hast, ignoriere diese Nachricht.
        </p>
        <p style="color:#9ca3af;font-size:12px;">${SITE_NAME} · ${SITE_DOMAIN}</p>
      </div>
    `,
  });
}
