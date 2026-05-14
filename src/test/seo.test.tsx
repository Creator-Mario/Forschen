import fs from 'node:fs';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { metadata } from '@/app/layout';
import { metadata as homeMetadata } from '@/app/(public)/page';
import { metadata as genealogieLoginMetadata } from '@/app/genealogie/login/page';
import { metadata as genealogieRegisterMetadata } from '@/app/genealogie/registrieren/page';
import { generateMetadata as generateAktionenMetadata } from '@/app/(public)/aktionen/page';
import { generateMetadata as generateTageswortMetadata } from '@/app/(public)/tageswort/page';
import { generateMetadata as generateForschungMetadata } from '@/app/(public)/forschung/page';
import { metadata as predigtMetadata } from '@/app/predigt/page';
import manifest from '@/app/manifest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { GET as getSiteWebmanifest } from '@/app/site.webmanifest/route';
import { canonicalSiteUrl, googleSiteVerification, operatorName, siteName } from '@/lib/config';
import legacyAmpCanonicalPaths from '@/lib/legacy-amp-canonical-paths.json';
import { getSitemapPublicPages, publicIndexablePages } from '@/lib/public-pages';
import { organizationStructuredData, websiteStructuredData } from '@/lib/seo';

describe('SEO metadata', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

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
             '/genealogie/login',
             '/genealogie/registrieren',
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

  it('marks genealogy auth landing pages as noindex with dedicated canonical paths', () => {
    expect(genealogieLoginMetadata.alternates?.canonical).toBe('/genealogie/login');
    expect(genealogieRegisterMetadata.alternates?.canonical).toBe('/genealogie/registrieren');
    expect(genealogieLoginMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(genealogieRegisterMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(genealogieLoginMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/genealogie/login`,
    });
    expect(genealogieRegisterMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/genealogie/registrieren`,
    });
  });

  it('defines route-specific metadata for indexable public content pages', async () => {
    const tageswortMetadata = await generateTageswortMetadata();

    expect(tageswortMetadata.alternates?.canonical).toBe('/tageswort');
    expect(tageswortMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/tageswort`,
    });
    expect(predigtMetadata.alternates?.canonical).toBe('/predigt');
    expect(predigtMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/predigt`,
    });
  });

  it('keeps public content pages indexable after the SEO route repairs', async () => {
    const [forschungMetadata, aktionenMetadata, tageswortMetadata] = await Promise.all([
      generateForschungMetadata(),
      generateAktionenMetadata(),
      generateTageswortMetadata(),
    ]);

    expect(forschungMetadata.alternates?.canonical).toBe('/forschung');
    expect(forschungMetadata.openGraph).toMatchObject({
      url: `${canonicalSiteUrl}/forschung`,
    });
    expect(forschungMetadata.robots).toBeUndefined();

    expect(aktionenMetadata.alternates?.canonical).toBe('/aktionen');
    expect(aktionenMetadata.robots).toBeUndefined();

    expect(tageswortMetadata.alternates?.canonical).toBe('/tageswort');
    expect(tageswortMetadata.robots).toBeUndefined();
  });

  it('publishes a web manifest and keeps every public indexable page in the sitemap', async () => {
    const sitemapEntries = await sitemap();
    const sitemapPages = await getSitemapPublicPages();

    expect(manifest()).toMatchObject({
      name: siteName,
      start_url: '/',
      icons: expect.arrayContaining([
        expect.objectContaining({ src: '/icon' }),
        expect.objectContaining({ src: '/apple-icon' }),
      ]),
    });

    expect(publicIndexablePages.some((page) => page.href === '/aktionen')).toBe(true);
    expect(sitemapPages).toHaveLength(publicIndexablePages.length);
    expect(sitemapPages.some((page) => page.href === '/aktionen')).toBe(true);
    expect(sitemapEntries).toHaveLength(sitemapPages.length);
    expect(sitemapEntries).toEqual(
      expect.arrayContaining(
        sitemapPages.map((page) =>
          expect.objectContaining({
            url: `${canonicalSiteUrl}${page.href}`,
            changeFrequency: page.changeFrequency,
            priority: page.priority,
          }),
        ),
      ),
    );
    expect(sitemapEntries.some((entry) => entry.url.includes('/amp/'))).toBe(false);
    expect(sitemapEntries.some((entry) => entry.url.endsWith('/registrieren'))).toBe(false);
    expect(sitemapEntries.some((entry) => entry.url.endsWith('/aktionen'))).toBe(true);
    expect(sitemapEntries.every((entry) => !('lastModified' in entry))).toBe(true);
  });

  it('serves a compatible site.webmanifest alias without a 404', async () => {
    const response = await getSiteWebmanifest();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/manifest+json');
    await expect(response.json()).resolves.toMatchObject(manifest());
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

  it('permanently redirects legacy AMP URLs to their canonical pages', async () => {
    const nextConfigModule = await import('../../next.config.js');
    const nextConfig = nextConfigModule.default ?? nextConfigModule;
    const redirects = await nextConfig.redirects();

    expect(legacyAmpCanonicalPaths).toEqual(publicIndexablePages.map((page) => page.href));
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/amp',
          destination: '/',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/amp/wochenthema',
          destination: '/wochenthema',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/amp/tageswort',
          destination: '/tageswort',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/amp/glauben-heute',
          destination: '/glauben-heute',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/amp/psalmen',
          destination: '/psalmen',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/amp/aktionen',
          destination: '/aktionen',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/amp/buchempfehlungen/archiv',
          destination: '/buchempfehlungen/archiv',
          permanent: true,
        }),
      ]),
    );
  });

  it('keeps next.config limited to the fixed AMP canonical redirects', async () => {
    const nextConfigModule = await import('../../next.config.js');
    const nextConfig = nextConfigModule.default ?? nextConfigModule;
    const redirects = await nextConfig.redirects();

    expect(redirects).toHaveLength(legacyAmpCanonicalPaths.length);
    expect(redirects.every((redirect) => !('has' in redirect))).toBe(true);
  });

  it('removes the deprecated AMP route handlers from the app router', () => {
    const deprecatedAmpAppDir = path.join(process.cwd(), 'src', 'app', 'amp');

    expect(fs.existsSync(deprecatedAmpAppDir)).toBe(false);
  });
});
