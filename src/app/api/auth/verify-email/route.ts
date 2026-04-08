import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailToken, saveUser } from '@/lib/db';

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
    // Already verified – redirect to intro form or login
    const dest = user.status === 'email_verified' ? '/vorstellung' : '/login';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Mark email as verified, remove token, advance status to email_verified
  await saveUser({
    ...user,
    emailToken: undefined,
    emailVerifiedAt: new Date().toISOString(),
    status: 'email_verified',
  });

  // Redirect to mandatory intro form
  return NextResponse.redirect(new URL(`/vorstellung?userId=${user.id}`, req.url));
}
