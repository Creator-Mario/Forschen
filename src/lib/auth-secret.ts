const DEFAULT_DEV_AUTH_SECRET = 'dev-secret-please-set-in-production';
const MISSING_PRODUCTION_AUTH_SECRET_WARNING =
  'NEXTAUTH_SECRET is missing in production. Using a temporary runtime secret until NEXTAUTH_SECRET is configured.';

let cachedTemporaryProductionSecret: string | null = null;
let hasWarnedAboutTemporaryProductionSecret = false;

function createTemporaryProductionSecret(): string {
  if (cachedTemporaryProductionSecret) {
    return cachedTemporaryProductionSecret;
  }

  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  cachedTemporaryProductionSecret = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return cachedTemporaryProductionSecret;
}

function getTemporaryProductionSecret(): string {
  if (!hasWarnedAboutTemporaryProductionSecret) {
    hasWarnedAboutTemporaryProductionSecret = true;
    console.error(MISSING_PRODUCTION_AUTH_SECRET_WARNING);
  }

  return createTemporaryProductionSecret();
}

export const authSecret = (() => {
  const configuredSecret = process.env.NEXTAUTH_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    return getTemporaryProductionSecret();
  }

  return DEFAULT_DEV_AUTH_SECRET;
})();

export {
  DEFAULT_DEV_AUTH_SECRET,
  MISSING_PRODUCTION_AUTH_SECRET_WARNING,
};
