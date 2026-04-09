/**
 * Central operator & site configuration.
 * All values are read from environment variables so they never need to be
 * hard-coded inside individual components.
 *
 * Required env vars (set in .env.local for development, Vercel env for prod):
 *   OPERATOR_NAME          – full legal name of the operator
 *   OPERATOR_EMAIL         – public contact e-mail address
 *   OPERATOR_PHONE_E164    – contact phone in E.164 format (e.g. +6283832835228)
 *   SITE_DOMAIN            – naked domain without protocol (e.g. flussdeslebens.live)
 *   ADMIN_SEED_EMAIL       – e-mail used to seed / identify the single admin account
 */

export const operatorName =
  process.env.OPERATOR_NAME ?? 'HIER_DEN_ECHTEN_BETREIBERNAMEN_EINTRAGEN_VOR_DEPLOY';

export const operatorEmail =
  process.env.OPERATOR_EMAIL ?? 'kontakt@flussdeslebens.live';

export const operatorPhoneE164 =
  process.env.OPERATOR_PHONE_E164 ?? '+6283832835228';

export const siteDomain =
  process.env.SITE_DOMAIN ?? 'flussdeslebens.live';

export const adminSeedEmail =
  process.env.ADMIN_SEED_EMAIL ?? 'kontakt@flussdeslebens.live';

/**
 * PayPal account e-mail used for donations.
 * Defaults to operatorEmail if not set separately, but can be overridden
 * when the PayPal account differs from the public contact address.
 */
export const paypalBusinessEmail =
  process.env.PAYPAL_BUSINESS_EMAIL ?? operatorEmail;

/** Operator's physical address – update here when it changes. */
export const operatorAddress = {
  street: 'NIRWANA GOLDEN PARK BLOK D9 NO.9',
  city: 'Bogor-Cibinong',
  zip: '16915',
  country: 'Indonesien',
} as const;
