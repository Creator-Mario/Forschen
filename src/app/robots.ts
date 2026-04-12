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
          '/dashboard',
          '/chat',
          '/fragestellungen',
          '/forschung',
          '/login',
          '/meine-',
          '/mitglieder/vorstellungen',
          '/passwort-vergessen',
          '/passwort-zuruecksetzen',
          '/profil',
          '/registrieren',
          '/videos',
        ],
      },
    ],
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
    host: canonicalSiteUrl,
  };
}
