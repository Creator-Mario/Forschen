import type { MetadataRoute } from 'next';

import { canonicalSiteUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/admin-login',
          '/admin-reset',
          '/aktionen/neu',
          '/archiv',
          '/buchempfehlungen/neu',
          '/buchempfehlungen/archiv',
          '/dashboard',
          '/forschung/archiv',
          '/chat',
          '/forschung/beitraege',
          '/fragestellungen',
          '/fragestellungen/neu',
          '/glauben-heute/archiv',
          '/gebet/neu',
          '/login',
          '/mein-tageswort',
          '/meine-',
          '/mitglieder/vorstellungen',
          '/passwort-vergessen',
          '/passwort-zuruecksetzen',
          '/psalmen/archiv',
          '/profil',
          '/registrieren',
          '/tageswort/archiv',
          '/thesen/archiv',
          '/thesen/neu',
          '/videos/hochladen',
          '/vorstellung',
          '/wochenthema/archiv',
        ],
      },
    ],
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
    host: canonicalSiteUrl,
  };
}
