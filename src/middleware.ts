import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  // Only protect authenticated (user) and (admin) routes.
  // Public routes (home, tageswort, wochenthema, thesen, forschung, gebet,
  // videos, aktionen, vision, login, registrieren, passwort-*, etc.) remain
  // freely accessible without a session.
  //
  // NOTE: /vorstellung, /admin-login and /admin-reset are intentionally NOT
  // protected here so that newly-verified users can fill in the intro form
  // before they have a session, and the admin can always reach their own
  // login / reset pages without an existing session.
  matcher: [
    '/dashboard/:path*',
    '/mein-tageswort/:path*',
    '/meine-buchempfehlungen/:path*',
    '/meine-thesen/:path*',
    '/meine-gebete/:path*',
    '/thesen/neu',
    '/buchempfehlungen/neu',
    '/forschung/beitraege',
    '/gebet/neu',
    '/chat/:path*',
    '/aktionen/neu',
    '/videos/hochladen',
    '/profil',
    '/admin/:path*',
  ],
};
