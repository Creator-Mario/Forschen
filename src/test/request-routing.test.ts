import { describe, expect, it } from 'vitest';

import {
  getCanonicalHostRedirectDestination,
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
