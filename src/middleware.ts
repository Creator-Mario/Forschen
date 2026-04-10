import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  // Only protect authenticated (user) and (admin) routes.
  // Public routes (home, tageswort, wochenthema, thesen, forschung, gebet,
  // videos, aktionen, vision, login, registrieren, passwort-*, etc.) remain
  // freely accessible without a session.
  matcher: [
    '/dashboard/:path*',
    '/mein-tageswort/:path*',
    '/meine-thesen/:path*',
    '/meine-gebete/:path*',
    '/thesen/neu',
    '/forschung/beitraege',
    '/gebet/neu',
    '/chat/:path*',
    '/aktionen/neu',
    '/videos/hochladen',
    '/profil',
    '/vorstellung',
    '/admin/:path*',
    '/admin-login',
    '/admin-reset',
  ],
};
