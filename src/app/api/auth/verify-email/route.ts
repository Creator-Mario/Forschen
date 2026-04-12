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
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token fehlt.' }, { status: 400 });
  }

  const user = getUserByEmailToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Ungültiger oder abgelaufener Token.' }, { status: 400 });
  }

  if (user.status !== 'pending_email') {
    const dest = user.status === 'email_verified'
      ? `/vorstellung${token ? `?token=${encodeURIComponent(token)}` : ''}`
      : '/login';
    return NextResponse.redirect(buildRedirectUrl(req, dest));
  }

  // Mark email as verified and keep the token until the intro is submitted so
  // the e-mail link remains the reliable identifier throughout onboarding.
  await saveUser({
    ...user,
    emailVerifiedAt: new Date().toISOString(),
    status: 'email_verified',
  });

  // Redirect to mandatory intro form
  return NextResponse.redirect(buildRedirectUrl(req, `/vorstellung?token=${encodeURIComponent(token)}`));
}
