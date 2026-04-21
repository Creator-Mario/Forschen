import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { metadata, websiteStructuredData } from '@/app/layout';
import { metadata as homeMetadata } from '@/app/(public)/page';
import { metadata as tageswortMetadata } from '@/app/(public)/tageswort/page';
import { metadata as forschungMetadata } from '@/app/(public)/forschung/page';
import manifest from '@/app/manifest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { canonicalSiteUrl, googleSiteVerification, operatorName, siteName } from '@/lib/config';
import { organizationStructuredData } from '@/lib/seo';

describe('SEO metadata', () => {
  it('configures canonical site metadata for the app shell', () => {
    expect(metadata.metadataBase?.toString()).toBe(`${canonicalSiteUrl}/`);
    expect(metadata.manifest).toBe('/manifest.webmanifest');
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.openGraph?.url).toBe(canonicalSiteUrl);
    expect(metadata.openGraph?.siteName).toBe(siteName);
    expect(metadata.verification?.google).toBe(googleSiteVerification);
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
    expect(organizationStructuredData.logo).toBe(`${canonicalSiteUrl}/icon`);
    expect(organizationStructuredData.address).toMatchObject({
      '@type': 'PostalAddress',
    });
    expect(websiteStructuredData['@type']).toBe('WebSite');
    expect(websiteStructuredData.url).toBe(canonicalSiteUrl);
    expect(websiteStructuredData.publisher.name).toBe(operatorName);
    expect(websiteStructuredData.publisher['@id']).toBe(`${canonicalSiteUrl}#organization`);
    expect(websiteStructuredData.description).toBe(metadata.description);
  });

  it('publishes robots rules that protect private areas while exposing the sitemap', () => {
    expect(robots()).toMatchObject({
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: expect.arrayContaining([
            '/admin',
            '/dashboard',
            '/login',
            '/registrieren',
            '/videos/hochladen',
            '/forschung/beitraege',
          ]),
        },
      ],
      sitemap: `${canonicalSiteUrl}/sitemap.xml`,
      host: canonicalSiteUrl,
    });
    const publicDisallowRules = robots().rules.find((rule) => rule.userAgent === '*')?.disallow ?? [];
    expect(publicDisallowRules).not.toContain('/forschung');
    expect(publicDisallowRules).not.toContain('/videos');
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
    const sitemapEntries = sitemap();

    expect(manifest()).toMatchObject({
      name: siteName,
      start_url: '/',
      icons: expect.arrayContaining([
        expect.objectContaining({ src: '/icon' }),
        expect.objectContaining({ src: '/apple-icon' }),
      ]),
    });

    expect(sitemapEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: `${canonicalSiteUrl}/` }),
        expect.objectContaining({ url: `${canonicalSiteUrl}/wochenthema` }),
        expect.objectContaining({ url: `${canonicalSiteUrl}/forschung` }),
        expect.objectContaining({ url: `${canonicalSiteUrl}/videos` }),
      ]),
    );
    expect(sitemapEntries.some((entry) => entry.url.endsWith('/registrieren'))).toBe(false);
    expect(sitemapEntries.every((entry) => !('lastModified' in entry))).toBe(true);
  });

  it('ships the Google site verification file at the public root path', () => {
    const verificationFilePath = path.join(
      process.cwd(),
      'public',
      'googleaf877f42def4409e.html',
    );

    expect(fs.existsSync(verificationFilePath)).toBe(true);
    expect(fs.readFileSync(verificationFilePath, 'utf8').trim()).toBe(
      'google-site-verification: googleaf877f42def4409e.html',
    );
  });

  it('configures standalone output mode with unoptimized images', async () => {
    const nextConfigModule = await import('../../next.config.js');
    const nextConfig = nextConfigModule.default ?? nextConfigModule;

    expect(nextConfig.output).toBe('standalone');
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it('redirects the apex domain to the canonical www host', async () => {
    const nextConfigModule = await import('../../next.config.js');
    const nextConfig = nextConfigModule.default ?? nextConfigModule;
    const redirects = await nextConfig.redirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/:path*',
          has: expect.arrayContaining([
            expect.objectContaining({
              type: 'host',
              value: 'flussdeslebens.live',
            }),
          ]),
          destination: 'https://www.flussdeslebens.live/:path*',
          permanent: true,
        }),
      ]),
    );
  });
});
