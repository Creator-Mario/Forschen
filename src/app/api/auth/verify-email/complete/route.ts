import { NextRequest, NextResponse } from 'next/server';

import { getUserByEmailToken, saveUser } from '@/lib/db';

function buildRedirectUrl(req: NextRequest, pathnameWithQuery: string): URL {
  const forwardedProto = req.headers.get('x-forwarded-proto')?.trim();
  const forwardedHost = req.headers.get('x-forwarded-host')?.trim();
  const host = forwardedHost || req.headers.get('host')?.trim() || req.nextUrl.host;
  const protocol = forwardedProto || req.nextUrl.protocol.replace(/:$/, '') || 'https';
  return new URL(pathnameWithQuery, `${protocol}://${host}`);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim();
  if (!token) {
    return NextResponse.redirect(buildRedirectUrl(req, '/email-bestaetigung'));
  }

  const user = getUserByEmailToken(token);
  if (!user) {
    return NextResponse.redirect(buildRedirectUrl(req, `/email-bestaetigung?token=${encodeURIComponent(token)}`));
  }

  if (user.status === 'pending_email') {
    await saveUser({
      ...user,
      emailVerifiedAt: new Date().toISOString(),
      status: 'email_verified',
    });
  }

  const effectiveStatus = user.status === 'pending_email' ? 'email_verified' : user.status;

  if (effectiveStatus !== 'email_verified') {
    return NextResponse.redirect(buildRedirectUrl(req, '/login'));
  }

  const response = NextResponse.redirect(buildRedirectUrl(req, '/vorstellung?verified=1'));
  response.cookies.set('intro_verification_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  });
  return response;
}
