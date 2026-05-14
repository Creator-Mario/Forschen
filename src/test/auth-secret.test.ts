import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('auth secret', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NODE_ENV;
  });

  it('uses the configured NEXTAUTH_SECRET when present', async () => {
    process.env.NEXTAUTH_SECRET = 'super-secret';
    process.env.NODE_ENV = 'production';

    const { authSecret } = await import('@/lib/auth-secret');

    expect(authSecret).toBe('super-secret');
  });

  it('keeps the development fallback outside production', async () => {
    process.env.NODE_ENV = 'test';

    const { authSecret } = await import('@/lib/auth-secret');

    expect(authSecret).toBe('dev-secret-please-set-in-production');
  });

  it('throws when NEXTAUTH_SECRET is missing in production', async () => {
    process.env.NODE_ENV = 'production';

    await expect(import('@/lib/auth-secret')).rejects.toThrow(
      'NEXTAUTH_SECRET must be set in production.',
    );
  });
});
