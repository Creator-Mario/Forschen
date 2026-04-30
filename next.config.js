const DEFAULT_SITE_DOMAIN = 'www.flussdeslebens.live';

function stripWwwPrefix(host) {
  return host.startsWith('www.') ? host.slice(4) : host;
}

function normalizeSiteDomain(domain = DEFAULT_SITE_DOMAIN) {
  const normalizedDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

  return normalizedDomain === stripWwwPrefix(DEFAULT_SITE_DOMAIN)
    ? DEFAULT_SITE_DOMAIN
    : normalizedDomain;
}

function normalizeCanonicalSiteUrl(url, canonicalDomain) {
  const trimmedUrl = url.trim().replace(/\/$/, '');

  try {
    const normalizedUrl = new URL(trimmedUrl);
    const apexDomain = stripWwwPrefix(canonicalDomain);

    if (canonicalDomain.startsWith('www.') && normalizedUrl.host.toLowerCase() === apexDomain) {
      normalizedUrl.host = canonicalDomain;
    }

    return normalizedUrl.toString().replace(/\/$/, '');
  } catch {
    return trimmedUrl;
  }
}

function getCanonicalSiteUrl() {
  const canonicalDomain = normalizeSiteDomain(process.env.SITE_DOMAIN);

  return normalizeCanonicalSiteUrl(
    process.env.EMAIL_LINK_BASE_URL ?? process.env.SITE_URL ?? `https://${canonicalDomain}`,
    canonicalDomain,
  );
}

function getCanonicalSiteOrigin() {
  try {
    return new URL(getCanonicalSiteUrl()).origin;
  } catch {
    return `https://${DEFAULT_SITE_DOMAIN}`;
  }
}

function getCanonicalHost() {
  try {
    return new URL(getCanonicalSiteOrigin()).host.toLowerCase();
  } catch {
    return DEFAULT_SITE_DOMAIN;
  }
}

function getApexHost(host) {
  return stripWwwPrefix(host);
}

const AMP_REDIRECTS = [
  ['/amp/glauben-heute', '/glauben-heute'],
  ['/amp/psalmen', '/psalmen'],
  ['/amp/tageswort', '/tageswort'],
  ['/amp/wochenthema', '/wochenthema'],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async redirects() {
    const canonicalOrigin = getCanonicalSiteOrigin();
    const canonicalHost = getCanonicalHost();
    const apexHost = getApexHost(canonicalHost);

    const redirects = AMP_REDIRECTS.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));

    if (!canonicalHost || canonicalHost === apexHost) {
      return redirects;
    }

    redirects.push({
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: apexHost,
        },
      ],
      destination: `${canonicalOrigin}/:path*`,
      permanent: true,
    });

    return redirects;
  },
};

module.exports = nextConfig;
