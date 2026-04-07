/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // For GitHub Pages static export, use 'export' output
  // output: 'export',
};

export default nextConfig;
