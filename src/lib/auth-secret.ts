const DEFAULT_DEV_AUTH_SECRET = 'dev-secret-please-set-in-production';

export const authSecret = (() => {
  const configuredSecret = process.env.NEXTAUTH_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET must be set in production.');
  }

  return DEFAULT_DEV_AUTH_SECRET;
})();
