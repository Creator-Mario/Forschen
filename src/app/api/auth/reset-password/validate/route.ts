import { NextRequest, NextResponse } from 'next/server';

import { validatePasswordResetToken } from '@/lib/reset-password-token';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token fehlt.' }, { status: 400 });
    }

    const result = validatePasswordResetToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Link-Prüfung fehlgeschlagen.' }, { status: 500 });
  }
}
