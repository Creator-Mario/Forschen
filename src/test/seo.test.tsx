import { describe, expect, it } from 'vitest';

import { metadata, websiteStructuredData } from '@/app/layout';
import robots from '@/app/robots';
import { canonicalSiteUrl, siteName } from '@/lib/config';

describe('SEO metadata', () => {
  it('configures canonical site metadata for the app shell', () => {
    expect(metadata.metadataBase?.toString()).toBe(`${canonicalSiteUrl}/`);
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.openGraph?.url).toBe(canonicalSiteUrl);
    expect(metadata.openGraph?.siteName).toBe(siteName);
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it('exposes structured website data with the canonical URL', () => {
    expect(websiteStructuredData['@type']).toBe('WebSite');
    expect(websiteStructuredData.url).toBe(canonicalSiteUrl);
    expect(websiteStructuredData.publisher.name).toBe(siteName);
  });

  it('publishes a crawlable robots definition with sitemap and host', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${canonicalSiteUrl}/sitemap.xml`,
      host: canonicalSiteUrl,
    });
  });
});
