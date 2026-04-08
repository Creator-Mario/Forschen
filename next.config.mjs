/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  ...(isGitHubPages
    ? {
        output: 'export',
        basePath: '/Forschen',
        assetPrefix: '/Forschen/',
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
