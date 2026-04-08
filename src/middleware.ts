import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes require ADMIN role (excludes /admin-login and /admin-reset which are public)
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    if (isAdminRoute && token?.role !== 'ADMIN') {
      if (token) {
        // User is logged in but not an admin – send to their dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // User is not logged in – send to admin login
      return NextResponse.redirect(new URL('/admin-login', req.url));
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
          '/impressum', '/admin-login', '/admin-reset'];
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
