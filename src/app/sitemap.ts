import type { MetadataRoute } from 'next';

import { canonicalSiteUrl } from '@/lib/config';

const PUBLIC_ROUTES = [
  '/',
  '/vision',
  '/tageswort',
  '/tageswort/archiv',
  '/wochenthema',
  '/wochenthema/archiv',
  '/thesen',
  '/psalmen',
  '/psalmen/archiv',
  '/glauben-heute',
  '/glauben-heute/archiv',
  '/buchempfehlungen',
  '/buchempfehlungen/archiv',
  '/aktionen',
  '/gebet',
  '/mitglieder/vorstellungen',
  '/spenden',
  '/impressum',
  '/datenschutz',
  '/registrieren',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${canonicalSiteUrl}${route}`,
  }));
}
