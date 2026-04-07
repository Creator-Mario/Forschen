export const dynamic = 'force-static';

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export function generateStaticParams() {
  return [
    { nextauth: ['session'] },
    { nextauth: ['csrf'] },
    { nextauth: ['providers'] },
    { nextauth: ['signin'] },
    { nextauth: ['signout'] },
    { nextauth: ['callback', 'credentials'] },
  ];
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
