import type { Metadata } from 'next';

import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SessionProvider } from '@/components/SessionProvider';
import { canonicalSiteUrl, googleSiteVerification, operatorName, siteName } from '@/lib/config';
import {
  defaultOgImage,
  defaultSeoDescription,
  defaultSeoKeywords,
  organizationStructuredData,
  serializeJsonLd,
  websiteStructuredData,
} from '@/lib/seo';

const siteDescription = defaultSeoDescription;

export const metadata: Metadata = {
  metadataBase: new URL(canonicalSiteUrl),
  applicationName: siteName,
  manifest: '/manifest.webmanifest',
  title: {
    default: 'Der Fluss des Lebens – Freie christliche Bibelforschung',
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: defaultSeoKeywords,
  authors: [{ name: operatorName, url: canonicalSiteUrl }],
  creator: operatorName,
  publisher: operatorName,
  category: 'religion',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32', type: 'image/png' },
      { url: '/icon', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
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
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Der Fluss des Lebens – Freie christliche Bibelforschung',
    description: siteDescription,
    images: [defaultOgImage.url],
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
  verification: {
    google: googleSiteVerification,
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
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd([organizationStructuredData, websiteStructuredData]),
            }}
          />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
