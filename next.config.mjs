/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Forschen',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
