import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.EMAIL_FROM;
    delete process.env.EMAIL_LINK_BASE_URL;
    delete process.env.OPERATOR_EMAIL;
    delete process.env.SITE_DOMAIN;
    delete process.env.SITE_URL;
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

  it('preserves an explicitly configured apex live domain', async () => {
    process.env.SITE_DOMAIN = 'flussdeslebens.live';
    process.env.SITE_URL = 'https://flussdeslebens.live/';

    const { canonicalSiteUrl, siteDomain } = await import('@/lib/config');

    expect(siteDomain).toBe('flussdeslebens.live');
    expect(canonicalSiteUrl).toBe('https://flussdeslebens.live');
  });

  it('preserves an explicitly configured www live domain', async () => {
    process.env.SITE_DOMAIN = 'www.flussdeslebens.live';
    process.env.SITE_URL = 'https://www.flussdeslebens.live/';

    const { canonicalSiteUrl, siteDomain } = await import('@/lib/config');

    expect(siteDomain).toBe('www.flussdeslebens.live');
    expect(canonicalSiteUrl).toBe('https://www.flussdeslebens.live');
  });

  it('falls back to the default canonical URL when SITE_URL is invalid', async () => {
    process.env.SITE_DOMAIN = '';
    process.env.SITE_URL = 'not-a-url';

    const { canonicalSiteUrl, siteDomain } = await import('@/lib/config');

    expect(siteDomain).toBe('flussdeslebens.live');
    expect(canonicalSiteUrl).toBe('https://flussdeslebens.live');
  });

  it('forces the canonical site URL onto https even when SITE_URL is configured with http', async () => {
    process.env.SITE_DOMAIN = 'www.flussdeslebens.live';
    process.env.SITE_URL = 'http://www.flussdeslebens.live';

    const { canonicalSiteUrl } = await import('@/lib/config');

    expect(canonicalSiteUrl).toBe('https://www.flussdeslebens.live');
  });
});
