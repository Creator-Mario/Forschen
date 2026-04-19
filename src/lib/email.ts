import fs from 'fs';
import os from 'os';
import path from 'path';
import { Resend } from 'resend';
import {
  siteName as SITE_NAME,
  siteDomain as SITE_DOMAIN,
  canonicalSiteUrl as CANONICAL_SITE_URL,
  emailFromAddress as FROM_EMAIL,
} from '@/lib/config';
import { buildWeeklyFaithEmailContent } from '@/lib/weekly-faith-email';
import type { Wochenthema } from '@/types';

/**
 * Returns true when the string looks like a deliverable e-mail address.
 * We deliberately keep this lightweight – full RFC 5322 parsing is not
 * needed here; we only want to catch obviously broken values (empty string,
 * the legacy soft-delete placeholder `deleted-xxx@deleted`, pure local
 * parts without a domain, etc.) before they reach Resend and create a
 * validation_error that would otherwise be hard to trace.
 */
function isDeliverableEmail(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (!trimmed) return false;
  // Must have exactly one @ separating a non-empty local part and a domain
  const atIdx = trimmed.lastIndexOf('@');
  if (atIdx < 1) return false;
  const domain = trimmed.slice(atIdx + 1);
  // Domain must look like a normal public hostname such as:
  //   example.com
  //   mail.example.co.uk
  // We intentionally reject bare hostnames like `localhost` or `user@nodot`.
  if (!/^[^.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/.test(domain)) return false;
  return true;
}

/** Returns the canonical live URL used inside outbound e-mails. */
function getBaseUrl(): string {
  return CANONICAL_SITE_URL;
}

const LOCAL_DEV_EMAIL_OUTBOX_PATH = path.join(os.tmpdir(), 'forschen-dev-email-outbox.json');

function canUseLocalDevEmailOutbox(): boolean {
  return !getConfiguredResendApiKey() && (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  );
}

function appendLocalDevEmail(message: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): void {
  const existing = fs.existsSync(LOCAL_DEV_EMAIL_OUTBOX_PATH)
    ? JSON.parse(fs.readFileSync(LOCAL_DEV_EMAIL_OUTBOX_PATH, 'utf-8')) as unknown[]
    : [];

  existing.push({
    ...message,
    createdAt: new Date().toISOString(),
  });

  fs.writeFileSync(LOCAL_DEV_EMAIL_OUTBOX_PATH, JSON.stringify(existing, null, 2), 'utf-8');
}

let _resend: Resend | null = null;
export function getEmailDeliveryDiagnostics() {
  const rawApiKey = process.env.RESEND_API_KEY;
  const trimmedApiKey = rawApiKey?.trim() ?? '';
  const configuredEmailFrom = process.env.EMAIL_FROM?.trim() ?? '';
  const emailFromConfiguredAndValid =
    configuredEmailFrom.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmailFrom);

  return {
    apiKeyPresent: trimmedApiKey.length > 0,
    apiKeyLooksValid: trimmedApiKey.startsWith('re_'),
    apiKeyHadWhitespace: Boolean(rawApiKey && rawApiKey !== trimmedApiKey),
    emailFromConfigured: configuredEmailFrom.length > 0,
    emailFromUsesFallback: !emailFromConfiguredAndValid,
    emailFromAddress: FROM_EMAIL,
  };
}

function getConfiguredResendApiKey(): string | null {
  const rawApiKey = process.env.RESEND_API_KEY;
  if (!rawApiKey) return null;

  const trimmedApiKey = rawApiKey.trim();
  if (!trimmedApiKey) return null;

  return trimmedApiKey;
}

function getResend(): Resend {
  if (!_resend) {
    const resendApiKey = getConfiguredResendApiKey();
    if (!resendApiKey) {
      throw new Error('[email] RESEND_API_KEY is not configured.');
    }

    if (!resendApiKey.startsWith('re_')) {
      throw new Error('[email] RESEND_API_KEY is malformed. Expected a value starting with "re_".');
    }

    if (process.env.RESEND_API_KEY !== resendApiKey) {
      console.warn('[email] RESEND_API_KEY contains surrounding whitespace; trimming it before initializing Resend.');
    }

    _resend = new Resend(resendApiKey);
  }
  return _resend;
}
/** Escapes HTML special characters to prevent injection in email templates. */
export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeEmailDisplayName(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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
  // Guard: reject obviously undeliverable addresses before hitting Resend.
  // This prevents validation_error entries in the Resend dashboard caused by
  // legacy soft-deleted accounts or empty/undefined values.
  if (!isDeliverableEmail(to)) {
    console.error('[email] Skipping send – invalid or undeliverable address:', JSON.stringify({ to, subject }));
    return false;
  }

  if (canUseLocalDevEmailOutbox()) {
    appendLocalDevEmail({ to, subject, html, text });
    console.info('[email] RESEND_API_KEY missing – wrote e-mail to local dev outbox:', LOCAL_DEV_EMAIL_OUTBOX_PATH);
    return true;
  }

  try {
    // RFC 5322: display names containing spaces must be double-quoted.
    const fromHeader = `"${escapeEmailDisplayName(SITE_NAME)}" <${FROM_EMAIL}>`;

    const { data, error } = await getResend().emails.send({
      from: fromHeader,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      const resendErr = error as { name?: string; message?: string; statusCode?: number };
      console.error('[email] Resend error:', JSON.stringify({
        name: resendErr.name,
        message: resendErr.message,
        statusCode: resendErr.statusCode,
        subject,
        to,
        from: fromHeader,
      }));
      return false;
    }

    console.info('[email] Sent:', subject, '→', to, '| id:', data?.id);
    return true;
  } catch (err) {
    const caught = err as { name?: string; message?: string; statusCode?: number };
    console.error('[email] Failed to send:', JSON.stringify({
      name: caught.name,
      message: caught.message,
      statusCode: caught.statusCode,
      subject,
      to,
    }));
    return false;
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  token: string,
): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    console.log('[sendVerificationEmail] Called with', { toEmail, token: token.slice(0, 8) + '…', baseUrl });
    const verifyUrl = `${baseUrl}/email-bestaetigung?token=${token}`;

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
  } catch (err) {
    console.error('[email] sendVerificationEmail failed:', err);
    return false;
  }
}

export async function sendAdminMessageEmail(
  toEmail: string,
  userName: string,
  contentType: string,
  adminMessage: string,
): Promise<boolean> {
  try {
    const dashboardUrl = `${getBaseUrl()}/dashboard`;

    return await sendEmail({
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
  } catch (err) {
    console.error('[email] sendAdminMessageEmail failed:', err);
    return false;
  }
}

/**
 * Sent to the new user right after they submit their intro form.
 * Tells them their registration is being reviewed.
 */
export async function sendRegistrationPendingEmail(
  toEmail: string,
  userName: string,
): Promise<boolean> {
  return sendEmail({
    to: toEmail,
    subject: `Deine Registrierung wird bearbeitet – ${SITE_NAME}`,
    text: `Hallo ${userName},\n\nVielen Dank für deine Vorstellung und Motivation!\n\nDeine Registrierung bei „${SITE_NAME}" ist eingegangen und wird nun von uns geprüft. Sobald die Prüfung abgeschlossen ist, erhältst du eine E-Mail und bekommst vollen Zugang zur Plattform.\n\nHerzliche Grüße,\n${SITE_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">Vielen Dank für deine Registrierung! 🙏</h2>
        <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
        <p style="color:#374151;line-height:1.6;">
          Vielen Dank für deine Vorstellung und Motivation!
          Deine Registrierung bei <strong>${SITE_NAME}</strong> ist eingegangen
          und wird nun von uns geprüft.
        </p>
        <p style="color:#374151;line-height:1.6;">
          Sobald die Prüfung abgeschlossen ist, erhältst du eine weitere E-Mail
          und bekommst vollen Zugang zur Plattform.
        </p>
        <p style="color:#374151;line-height:1.6;">Herzliche Grüße,<br>${SITE_NAME}</p>
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
  try {
    const loginUrl = `${getBaseUrl()}/login`;

    const subject = approved
      ? `Dein Konto wurde freigeschaltet – ${SITE_NAME}`
      : `Rückfrage zu deiner Anmeldung – ${SITE_NAME}`;

    const bodyText = approved
      ? `Hallo ${userName},\n\nDein Konto bei „${SITE_NAME}" wurde freigeschaltet. Du kannst dich jetzt einloggen:\n\n${loginUrl}\n\n${note ? `Notiz des Admins: ${note}\n\n` : ''}Herzlich willkommen!\n\n${SITE_NAME}`
      : `Hallo ${userName},\n\nDer Administrator hat eine Rückfrage zu deiner Anmeldung:\n\n"${note}"\n\nBitte melde dich in deinem Dashboard.\n\n${SITE_NAME}`;

    const bodyHtml = approved
      ? `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1e3a8a;margin-bottom:16px;">Dein Konto wurde freigeschaltet 🎉</h2>
        <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
        <p style="color:#374151;line-height:1.6;">
          Dein Konto bei <strong>${SITE_NAME}</strong> wurde freigeschaltet.
          Du kannst dich jetzt einloggen und die Plattform vollständig nutzen.
        </p>
        ${note ? `<p style="color:#374151;line-height:1.6;font-style:italic;">${escHtml(note)}</p>` : ''}
        <a href="${loginUrl}"
           style="display:inline-block;margin:24px 0;background:#1e40af;color:#fff;
                  text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
          Jetzt einloggen →
        </a>
        <p style="color:#6b7280;font-size:13px;">
          Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
          <a href="${loginUrl}" style="color:#2563eb;">${loginUrl}</a>
        </p>
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

    return await sendEmail({
      to: toEmail,
      subject,
      text: bodyText,
      html: bodyHtml,
    });
  } catch (err) {
    console.error('[email] sendAdminApprovalEmail failed:', err);
    return false;
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  token: string,
): Promise<boolean> {
  try {
    const resetUrl = `${getBaseUrl()}/passwort-zuruecksetzen?token=${token}`;

    return await sendEmail({
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
  } catch (err) {
    console.error('[email] sendPasswordResetEmail failed:', err);
    return false;
  }
}

export async function sendWeeklyFaithEmail(
  toEmail: string,
  userName: string,
  theme: Wochenthema,
): Promise<boolean> {
  try {
    const content = buildWeeklyFaithEmailContent(userName, theme);

    return await sendEmail({
      to: toEmail,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  } catch (err) {
    console.error('[email] sendWeeklyFaithEmail failed:', err);
    return false;
  }
}
