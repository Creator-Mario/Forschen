import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes require ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-please-set-in-production',
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname;
        // Public routes don't require auth
        const publicRoutes = ['/', '/vision', '/tageswort', '/wochenthema', '/thesen', '/forschung',
          '/gebet', '/videos', '/aktionen', '/spenden', '/login', '/registrieren', '/datenschutz',
          '/impressum', '/admin-login'];
        if (publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
