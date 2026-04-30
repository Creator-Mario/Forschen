import type { MetadataRoute } from 'next';

import { canonicalSiteUrl } from '@/lib/config';
import { publicIndexablePages } from '@/lib/public-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  return publicIndexablePages.map((page) => ({
    url: `${canonicalSiteUrl}${page.href}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
