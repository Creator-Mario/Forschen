import type { MetadataRoute } from 'next';

import { canonicalSiteUrl } from '@/lib/config';
import { getSitemapPublicPages } from '@/lib/public-pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getSitemapPublicPages();

  return pages.map((page) => ({
    url: `${canonicalSiteUrl}${page.href}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
