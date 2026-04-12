import { NextRequest, NextResponse } from 'next/server';

function buildRedirectUrl(req: NextRequest, pathnameWithQuery: string): URL {
  const forwardedProto = req.headers.get('x-forwarded-proto')?.trim();
  const forwardedHost = req.headers.get('x-forwarded-host')?.trim();
  const host = forwardedHost || req.headers.get('host')?.trim() || req.nextUrl.host;
  const protocol = forwardedProto || req.nextUrl.protocol.replace(/:$/, '') || 'https';
  return new URL(pathnameWithQuery, `${protocol}://${host}`);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim();
  const destination = token
    ? `/email-bestaetigung?token=${encodeURIComponent(token)}`
    : '/email-bestaetigung';
  return NextResponse.redirect(buildRedirectUrl(req, destination));
}
