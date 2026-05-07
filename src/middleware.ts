import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authSecret } from '@/lib/auth-secret';
import { canonicalSiteUrl } from '@/lib/config';
import {
  getAuthRedirectPath,
  getCanonicalHostRedirectDestination,
  getLegacyAmpRedirectDestination,
  isAdminPath,
  isProtectedPath,
} from '@/lib/request-routing';

export default async function middleware(request: NextRequest) {
  const redirectDestination = getCanonicalHostRedirectDestination({
    requestUrl: request.url,
    requestHosts: [
      request.headers.get('host'),
      request.headers.get('x-forwarded-host'),
      request.nextUrl.host,
    ],
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
    const token = await getToken({ req: request, secret: authSecret });

    if (!token) {
      const signInPath = getAuthRedirectPath({
        pathname: request.nextUrl.pathname,
        search: request.nextUrl.search,
        requireAdmin: isAdminPath(request.nextUrl.pathname),
      });

      return NextResponse.redirect(new URL(signInPath, request.url));
    }

    if (isAdminPath(request.nextUrl.pathname) && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
