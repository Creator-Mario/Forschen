import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('config – emailFromAddress', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.EMAIL_FROM;
    delete process.env.OPERATOR_EMAIL;
  });

  it('uses EMAIL_FROM exactly as configured for a valid noreply sender', async () => {
    process.env.EMAIL_FROM = 'noreply@flussdeslebens.live';
    process.env.OPERATOR_EMAIL = 'kontakt@flussdeslebens.live';

    const { emailFromAddress } = await import('@/lib/config');

    expect(emailFromAddress).toBe('noreply@flussdeslebens.live');
  });

  it('falls back to OPERATOR_EMAIL when EMAIL_FROM is invalid', async () => {
    process.env.EMAIL_FROM = 'not-an-email';
    process.env.OPERATOR_EMAIL = 'kontakt@flussdeslebens.live';

    const { emailFromAddress } = await import('@/lib/config');

    expect(emailFromAddress).toBe('kontakt@flussdeslebens.live');
  });
});
