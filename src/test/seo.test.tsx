import { describe, expect, it } from 'vitest';

import { metadata, websiteStructuredData } from '@/app/layout';
import { metadata as homeMetadata } from '@/app/(public)/page';
import { metadata as tageswortMetadata } from '@/app/(public)/tageswort/page';
import { metadata as forschungMetadata } from '@/app/(public)/forschung/page';
import manifest from '@/app/manifest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { canonicalSiteUrl, siteName } from '@/lib/config';
import { organizationStructuredData } from '@/lib/seo';

describe('SEO metadata', () => {
  it('configures canonical site metadata for the app shell', () => {
    expect(metadata.metadataBase?.toString()).toBe(`${canonicalSiteUrl}/`);
    expect(metadata.manifest).toBe('/manifest.webmanifest');
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.openGraph?.url).toBe(canonicalSiteUrl);
    expect(metadata.openGraph?.siteName).toBe(siteName);
    expect(metadata.openGraph?.images).toContainEqual(
      expect.objectContaining({ url: '/opengraph-image' }),
    );
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it('exposes structured organization and website data with the canonical URL', () => {
    expect(organizationStructuredData['@type']).toBe('Organization');
    expect(organizationStructuredData.url).toBe(canonicalSiteUrl);
    expect(websiteStructuredData['@type']).toBe('WebSite');
    expect(websiteStructuredData.url).toBe(canonicalSiteUrl);
    expect(websiteStructuredData.publisher.name).toBe(siteName);
  });

  it('publishes robots rules that protect private areas while exposing the sitemap', () => {
    expect(robots()).toMatchObject({
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: expect.arrayContaining(['/admin', '/dashboard', '/login', '/registrieren']),
        },
      ],
      sitemap: `${canonicalSiteUrl}/sitemap.xml`,
      host: canonicalSiteUrl,
    });
  });

  it('defines route-specific metadata for the public homepage', () => {
    expect(homeMetadata.description).toContain('Tageswort');
    expect(homeMetadata.alternates?.canonical).toBe('/');
    expect(homeMetadata.openGraph).toMatchObject({
      url: canonicalSiteUrl,
    });
  });

  it('defines route-specific metadata for indexable public content pages', () => {
    expect(tageswortMetadata.alternates?.canonical).toBe('/tageswort');
    expect(tageswortMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/tageswort`,
    });
  });

  it('keeps public content pages indexable after the SEO route repairs', () => {
    expect(forschungMetadata.alternates?.canonical).toBe('/forschung');
    expect(forschungMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/forschung`,
    });
  });

  it('publishes a web manifest and an indexable sitemap', () => {
    expect(manifest()).toMatchObject({
      name: siteName,
      start_url: '/',
      icons: expect.arrayContaining([
        expect.objectContaining({ src: '/icon' }),
        expect.objectContaining({ src: '/apple-icon' }),
      ]),
    });

    expect(sitemap()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: `${canonicalSiteUrl}/` }),
        expect.objectContaining({ url: `${canonicalSiteUrl}/wochenthema` }),
      ]),
    );
    expect(sitemap().some((entry) => entry.url.endsWith('/registrieren'))).toBe(false);
  });

  it('serves blocking metadata for all user agents', async () => {
    const nextConfig = (await import('../../next.config.mjs')).default;

    expect(nextConfig.htmlLimitedBots).toBeInstanceOf(RegExp);
    expect(nextConfig.htmlLimitedBots?.test('Mozilla/5.0 HeadlessChrome/146.0.0.0 Safari/537.36')).toBe(true);
    expect(nextConfig.htmlLimitedBots?.test('Mozilla/5.0 Chrome/146.0.0.0 Mobile Safari/537.36')).toBe(true);
  });
});
