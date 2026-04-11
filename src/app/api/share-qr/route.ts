import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { canonicalSiteUrl } from '@/lib/config';

export async function GET() {
  const svg = await QRCode.toString(canonicalSiteUrl, {
    type: 'svg',
    width: 220,
    margin: 1,
    color: {
      dark: '#0d47a1',
      light: '#0000',
    },
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
