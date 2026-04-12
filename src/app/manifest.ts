import type { MetadataRoute } from 'next';

import { siteName } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Fluss des Lebens',
    description:
      'Freie christliche Bibelforschung mit Tageswort, Wochenthema, Psalmen und gemeinschaftlichem Gebet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#1565c0',
    lang: 'de-DE',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
