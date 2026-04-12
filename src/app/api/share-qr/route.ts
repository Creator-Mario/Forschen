import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { canonicalSiteUrl } from '@/lib/config';

const qrOptions = {
  margin: 1,
  color: {
    dark: '#0d47a1',
    light: '#0000',
  },
} as const;

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') === 'png' ? 'png' : 'svg';
  const download = request.nextUrl.searchParams.get('download') === '1';
  const filename = `fluss-des-lebens-qr-code.${format}`;

  if (format === 'png') {
    const png = await QRCode.toBuffer(canonicalSiteUrl, {
      ...qrOptions,
      type: 'png',
      width: 512,
    });

    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        ...(download ? { 'Content-Disposition': `attachment; filename="${filename}"` } : {}),
      },
    });
  }

  const svg = await QRCode.toString(canonicalSiteUrl, {
    ...qrOptions,
    type: 'svg',
    width: 220,
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      ...(download ? { 'Content-Disposition': `attachment; filename="${filename}"` } : {}),
    },
  });
}
