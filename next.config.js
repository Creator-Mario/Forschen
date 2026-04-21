const DEFAULT_SITE_DOMAIN = 'www.flussdeslebens.live';

function getCanonicalSiteUrl() {
  return (process.env.EMAIL_LINK_BASE_URL ?? process.env.SITE_URL ?? `https://${process.env.SITE_DOMAIN ?? DEFAULT_SITE_DOMAIN}`)
    .trim()
    .replace(/\/$/, '');
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
  return host.startsWith('www.') ? host.slice(4) : host;
}

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

    if (!canonicalHost || canonicalHost === apexHost) {
      return [];
    }

    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: apexHost,
          },
        ],
        destination: `${canonicalOrigin}/:path*`,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
