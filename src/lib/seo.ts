import type { Metadata } from 'next';

import {
  canonicalSiteUrl,
  operatorAddress,
  operatorEmail,
  operatorName,
  siteDomain,
  siteName,
} from '@/lib/config';

const defaultDescription =
  'Freie christliche Bibelforschung mit Tageswort, Psalmen, Wochenthema, Forschungsbeiträgen und gemeinschaftlichem Gebet.';

const defaultKeywords = [
  'christliche Bibelforschung',
  'Bibelstudium',
  'Tageswort',
  'Wochenthema',
  'Psalmen',
  'Gebet',
  'Theologische Thesen',
  'Christliche Gemeinschaft',
] as const;

export const defaultSeoDescription = defaultDescription;

export const defaultSeoKeywords = [...defaultKeywords];

export const defaultOgImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${siteName} – christliche Bibelforschung`,
} as const;

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | '/';
  keywords?: string[];
  noIndex?: boolean;
};

type CollectionPageStructuredDataOptions = {
  name: string;
  description: string;
  path: `/${string}` | '/';
  about?: string[];
  keywords?: string[];
  isAccessibleForFree?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: `${canonicalSiteUrl}${path === '/' ? '' : path}`,
      siteName,
      title,
      description,
      images: [defaultOgImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultOgImage.url],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : undefined,
  };
}

export function createNoIndexMetadata(
  title: string,
  description: string,
  path: `/${string}` | '/',
): Metadata {
  return createPageMetadata({
    title,
    description,
    path,
    noIndex: true,
  });
}

export function createCollectionPageStructuredData({
  name,
  description,
  path,
  about = [],
  keywords = [],
  isAccessibleForFree = true,
}: CollectionPageStructuredDataOptions) {
  const url = `${canonicalSiteUrl}${path === '/' ? '' : path}`;
  const aboutItems = about.map((item) => ({
    '@type': 'Thing',
    name: item,
  }));
  const keywordText = keywords.join(', ');

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'de-DE',
    isPartOf: {
      '@id': `${canonicalSiteUrl}#website`,
    },
    isAccessibleForFree,
    ...(aboutItems.length > 0 ? { about: aboutItems } : {}),
    ...(keywordText ? { keywords: keywordText } : {}),
  };
}

export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${canonicalSiteUrl}#organization`,
  name: operatorName,
  url: canonicalSiteUrl,
  email: operatorEmail,
  logo: `${canonicalSiteUrl}/icon`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: operatorAddress.street,
    addressLocality: operatorAddress.city,
    postalCode: operatorAddress.zip,
    addressCountry: operatorAddress.country,
  },
  sameAs: [`https://${siteDomain}`],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: operatorEmail,
      contactType: 'customer support',
      availableLanguage: ['de', 'en'],
    },
  ],
} as const;
