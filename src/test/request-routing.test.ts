import { describe, expect, it } from 'vitest';

import {
  getCanonicalHostRedirectDestination,
  getLegacyAmpRedirectDestination,
  isProtectedPath,
  normalizeHost,
} from '@/lib/request-routing';

describe('request routing helpers', () => {
  it('normalizes forwarded hosts before comparison', () => {
    expect(normalizeHost(' FlussDesLebens.Live:443 ')).toBe('flussdeslebens.live');
    expect(normalizeHost('www.flussdeslebens.live, proxy.internal')).toBe('www.flussdeslebens.live');
  });

  it('redirects the apex domain to the canonical www host while preserving the path and query', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://flussdeslebens.live/googleaf877f42def4409e.html?source=gsc',
        requestHost: 'flussdeslebens.live:443',
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBe('https://www.flussdeslebens.live/googleaf877f42def4409e.html?source=gsc');
  });

  it('does not redirect requests that already use the canonical host', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://www.flussdeslebens.live/',
        requestHost: 'www.flussdeslebens.live',
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBeNull();
  });

  it('does not create a redirect loop when a proxy forwards the apex host for an already canonical URL', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://www.flussdeslebens.live/wochenthema',
        requestHost: 'flussdeslebens.live',
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBeNull();
  });

  it('redirects legacy AMP URLs to the canonical page while preserving the query string', () => {
    expect(
      getLegacyAmpRedirectDestination(
        'https://flussdeslebens.live/amp/glauben-heute?source=gsc',
        'https://www.flussdeslebens.live',
      ),
    ).toBe('https://www.flussdeslebens.live/glauben-heute?source=gsc');
  });

  it('normalizes a trailing slash on legacy AMP URLs', () => {
    expect(
      getLegacyAmpRedirectDestination(
        'https://www.flussdeslebens.live/amp/tageswort/archiv/',
        'https://www.flussdeslebens.live',
      ),
    ).toBe('https://www.flussdeslebens.live/tageswort/archiv');
  });

  it('redirects the deprecated AMP homepage to the root canonical URL', () => {
    expect(
      getLegacyAmpRedirectDestination(
        'https://www.flussdeslebens.live/amp?source=gsc',
        'https://www.flussdeslebens.live',
      ),
    ).toBe('https://www.flussdeslebens.live/?source=gsc');
  });

  it('ignores unknown AMP-like paths', () => {
    expect(
      getLegacyAmpRedirectDestination(
        'https://www.flussdeslebens.live/amp/unbekannt',
        'https://www.flussdeslebens.live',
      ),
    ).toBeNull();
  });

  it('protects only the intended authenticated routes', () => {
    expect(isProtectedPath('/admin')).toBe(true);
    expect(isProtectedPath('/admin/system')).toBe(true);
    expect(isProtectedPath('/chat')).toBe(true);
    expect(isProtectedPath('/chat/123')).toBe(true);
    expect(isProtectedPath('/profil')).toBe(true);
    expect(isProtectedPath('/admin-login')).toBe(false);
    expect(isProtectedPath('/vorstellung')).toBe(false);
    expect(isProtectedPath('/wochenthema')).toBe(false);
  });
});
