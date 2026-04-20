/**
 * Central operator & site configuration.
 * All values are read from environment variables so they never need to be
 * hard-coded inside individual components.
 *
 * Required env vars (set in .env.local for development and in production envs):
 *   OPERATOR_NAME          – full legal name of the operator
 *   OPERATOR_EMAIL         – public contact e-mail address
 *   OPERATOR_PHONE_E164    – contact phone in E.164 format (e.g. +6283832835228)
 *   SITE_DOMAIN            – naked domain without protocol (e.g. www.flussdeslebens.live)
 *   ADMIN_SEED_EMAIL       – e-mail used to seed / identify the single admin account
 */

export const operatorName =
  process.env.OPERATOR_NAME ?? 'Der Fluss des Lebens';

export const operatorEmail =
  process.env.OPERATOR_EMAIL ?? 'kontakt@flussdeslebens.live';

export const operatorPhoneE164 =
  process.env.OPERATOR_PHONE_E164 ?? '+6283832835228';

export const siteDomain =
  process.env.SITE_DOMAIN ?? 'www.flussdeslebens.live';

export const siteName = 'Der Fluss des Lebens';

/**
 * Canonical public URL used in outbound e-mails.
 * We intentionally prefer the real live domain over NEXTAUTH_URL so that
 * Resend sees matching link URLs and sending domain.
 */
export const canonicalSiteUrl =
  (process.env.EMAIL_LINK_BASE_URL ?? process.env.SITE_URL ?? `https://${siteDomain}`)
    .trim()
    .replace(/\/$/, '');

export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() || '8qrr9y5mXoHjrEcjmHknia6AII5XTeFlf_uvocJMbCc';

export const adminSeedEmail =
  process.env.ADMIN_SEED_EMAIL ?? 'kontakt@flussdeslebens.live';

/**
 * Canonical sender address for Resend e-mails.
 * Use EMAIL_FROM as configured when it is a syntactically valid address.
 * Fall back to the public operator address only when EMAIL_FROM is missing or invalid.
 */
export const emailFromAddress = (() => {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configured)) return configured;
  return operatorEmail;
})();

/**
 * PayPal account e-mail used for donations.
 * Defaults to marioreinerdenzer@gmail.com (the PayPal account) if not set
 * separately via env var, as it differs from the public contact address.
 */
export const paypalBusinessEmail =
  process.env.PAYPAL_BUSINESS_EMAIL ?? 'marioreinerdenzer@gmail.com';

/** Operator's physical address – update here when it changes. */
export const operatorAddress = {
  street: 'NIRWANA GOLDEN PARK BLOK D9 NO.9',
  city: 'Bogor-Cibinong',
  zip: '16915',
  country: 'Indonesien',
} as const;
