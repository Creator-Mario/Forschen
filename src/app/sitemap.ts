import type { MetadataRoute } from 'next';

import { canonicalSiteUrl } from '@/lib/config';

const PUBLIC_ROUTES = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/vision', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/tageswort', changeFrequency: 'daily', priority: 0.9 },
  { path: '/tageswort/archiv', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/wochenthema', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/wochenthema/archiv', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/thesen', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/psalmen', changeFrequency: 'daily', priority: 0.8 },
  { path: '/psalmen/archiv', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/glauben-heute', changeFrequency: 'daily', priority: 0.8 },
  { path: '/glauben-heute/archiv', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/buchempfehlungen', changeFrequency: 'daily', priority: 0.8 },
  { path: '/buchempfehlungen/archiv', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/forschung', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/videos', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/aktionen', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/gebet', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/spenden', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/impressum', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/datenschutz', changeFrequency: 'yearly', priority: 0.3 },
] as const;

const AMP_ROUTES = [
  { path: '/amp/tageswort', changeFrequency: 'daily', priority: 0.8 },
  { path: '/amp/wochenthema', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/amp/psalmen', changeFrequency: 'daily', priority: 0.7 },
  { path: '/amp/glauben-heute', changeFrequency: 'daily', priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const canonical = PUBLIC_ROUTES.map((route) => ({
    url: `${canonicalSiteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const amp = AMP_ROUTES.map((route) => ({
    url: `${canonicalSiteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...canonical, ...amp];
}
