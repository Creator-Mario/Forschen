import type { Metadata } from 'next';

import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SessionProvider } from '@/components/SessionProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { canonicalSiteUrl, operatorName, siteName } from '@/lib/config';

const siteDescription = 'Freie christliche Bibelforschung mit Tageswort, Thesen, Forschungsbeiträgen und gemeinschaftlichem Gebet.';

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  alternateName: 'Der Fluss des Lebens – Freie christliche Bibelforschung',
  url: canonicalSiteUrl,
  inLanguage: 'de-DE',
  publisher: {
    '@type': 'Organization',
    name: operatorName,
    url: canonicalSiteUrl,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${canonicalSiteUrl}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(canonicalSiteUrl),
  applicationName: siteName,
  title: {
    default: 'Der Fluss des Lebens – Freie christliche Bibelforschung',
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'christliche Bibelforschung',
    'Bibelstudium',
    'Tageswort',
    'Theologische Thesen',
    'Gebet',
    'Christliche Gemeinschaft',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: canonicalSiteUrl,
    siteName,
    title: 'Der Fluss des Lebens – Freie christliche Bibelforschung',
    description: siteDescription,
  },
  twitter: {
    card: 'summary',
    title: 'Der Fluss des Lebens – Freie christliche Bibelforschung',
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="font-sans flex flex-col min-h-screen text-gray-800">
        <SessionProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
          />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
        </SessionProvider>
      </body>
    </html>
  );
}
