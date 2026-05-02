import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { authSecret } from '@/lib/auth-secret';
import { canonicalSiteUrl } from '@/lib/config';
import {
  getCanonicalHostRedirectDestination,
  getLegacyAmpRedirectDestination,
  isProtectedPath,
} from '@/lib/request-routing';

const authMiddleware = withAuth({
  pages: { signIn: '/login' },
  secret: authSecret,
}) as NextMiddleware;

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const redirectDestination = getCanonicalHostRedirectDestination({
    requestUrl: request.url,
    requestHost: request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host,
    canonicalSiteUrl,
  });
  const ampRedirectDestination = getLegacyAmpRedirectDestination(
    redirectDestination ?? request.url,
    canonicalSiteUrl,
  );

  if (ampRedirectDestination) {
    return NextResponse.redirect(ampRedirectDestination, 308);
  }

  if (redirectDestination) {
    return NextResponse.redirect(redirectDestination, 308);
  }

  if (isProtectedPath(request.nextUrl.pathname)) {
    return authMiddleware(request, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
