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
    return AMP_REDIRECTS.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

module.exports = nextConfig;
