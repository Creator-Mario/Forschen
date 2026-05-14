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
          '/buchempfehlungen/neu',
          '/dashboard',
          '/chat',
          '/forschung/archiv',
          '/forschung/beitraege',
          '/fragestellungen',
          '/fragestellungen/neu',
          '/gebet/neu',
          '/login',
          '/mein-tageswort',
          '/meine-',
          '/mitglieder/vorstellungen',
          '/passwort-vergessen',
          '/passwort-zuruecksetzen',
          '/profil',
          '/registrieren',
          '/thesen/archiv',
          '/thesen/neu',
          '/videos/hochladen',
          '/vorstellung',
        ],
      },
    ],
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
    host: canonicalSiteUrl,
  };
}
