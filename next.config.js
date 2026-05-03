const legacyAmpCanonicalPaths = require('./src/lib/legacy-amp-canonical-paths.json');

const AMP_REDIRECTS = legacyAmpCanonicalPaths.map((destination) => [
  destination === '/' ? '/amp' : `/amp${destination}`,
  destination,
]);

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
