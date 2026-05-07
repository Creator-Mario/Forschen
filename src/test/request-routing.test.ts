import { describe, expect, it } from 'vitest';

import {
  getAuthRedirectPath,
  getCanonicalHostRedirectDestination,
  getLegacyAmpRedirectDestination,
  getPostLoginRedirectPath,
  getSafeCallbackUrl,
  isAdminPath,
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
        requestHosts: ['flussdeslebens.live:443'],
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBe('https://www.flussdeslebens.live/googleaf877f42def4409e.html?source=gsc');
  });

  it('does not redirect requests that already use the canonical host', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://www.flussdeslebens.live/',
        requestHosts: ['www.flussdeslebens.live'],
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBeNull();
  });

  it('does not create a redirect loop when a proxy forwards the apex host for an already canonical URL', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://www.flussdeslebens.live/wochenthema',
        requestHosts: ['flussdeslebens.live'],
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBeNull();
  });

  it('does not redirect when at least one trusted host source already matches the canonical host', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://deployment-id.vercel.app/',
        requestHosts: ['www.flussdeslebens.live', 'flussdeslebens.live'],
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBeNull();
  });

  it('redirects when all observed hosts point to the apex domain', () => {
    expect(
      getCanonicalHostRedirectDestination({
        requestUrl: 'https://deployment-id.vercel.app/vision?source=gsc',
        requestHosts: ['flussdeslebens.live', 'flussdeslebens.live:443'],
        canonicalSiteUrl: 'https://www.flussdeslebens.live',
      }),
    ).toBe('https://www.flussdeslebens.live/vision?source=gsc');
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

  it('detects admin paths consistently', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/system')).toBe(true);
    expect(isAdminPath('/admin-login')).toBe(false);
  });

  it('builds login redirects with the original callback target', () => {
    expect(getAuthRedirectPath({ pathname: '/thesen/neu', search: '?ref=cta' }))
      .toBe('/login?callbackUrl=%2Fthesen%2Fneu%3Fref%3Dcta');
    expect(getAuthRedirectPath({ pathname: '/admin/system', search: '?tab=mail', requireAdmin: true }))
      .toBe('/admin-login?callbackUrl=%2Fadmin%2Fsystem%3Ftab%3Dmail');
  });

  it('accepts only safe internal callback URLs', () => {
    expect(getSafeCallbackUrl('/mitglieder/vorstellungen')).toBe('/mitglieder/vorstellungen');
    expect(getSafeCallbackUrl('/admin/system')).toBeNull();
    expect(getSafeCallbackUrl('/admin/system', { allowAdmin: true })).toBe('/admin/system');
    expect(getSafeCallbackUrl('https://evil.example')).toBeNull();
    expect(getSafeCallbackUrl('//evil.example')).toBeNull();
  });

  it('chooses the correct post-login destination based on role', () => {
    expect(getPostLoginRedirectPath('USER', '/mitglieder/vorstellungen')).toBe('/mitglieder/vorstellungen');
    expect(getPostLoginRedirectPath('USER', '/admin/system')).toBe('/dashboard');
    expect(getPostLoginRedirectPath('ADMIN', '/admin/system')).toBe('/admin');
    expect(getPostLoginRedirectPath('ADMIN', '/admin/system', { allowAdminCallback: true })).toBe('/admin/system');
    expect(getPostLoginRedirectPath('ADMIN', 'https://evil.example')).toBe('/admin');
  });
});
