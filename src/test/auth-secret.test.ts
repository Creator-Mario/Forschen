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

  it('uses a temporary runtime secret when NEXTAUTH_SECRET is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { authSecret, MISSING_PRODUCTION_AUTH_SECRET_WARNING } = await import('@/lib/auth-secret');

    expect(authSecret).toMatch(/^[a-f0-9]{64}$/);
    expect(authSecret).not.toBe('dev-secret-please-set-in-production');
    expect(consoleError).toHaveBeenCalledWith(MISSING_PRODUCTION_AUTH_SECRET_WARNING);
    consoleError.mockRestore();
  });
});
