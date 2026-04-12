import { HTML_LIMITED_BOT_UA_RE } from 'next/dist/shared/lib/router/utils/html-bots.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  htmlLimitedBots: new RegExp(`${HTML_LIMITED_BOT_UA_RE.source}|HeadlessChrome`, HTML_LIMITED_BOT_UA_RE.flags),
};

export default nextConfig;
