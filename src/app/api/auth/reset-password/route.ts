import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { saveUser } from '@/lib/db';
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE } from '@/lib/password-policy';
import { validatePasswordResetToken } from '@/lib/reset-password-token';

export async function GET() {
  return NextResponse.json(
    { error: 'Methode nicht unterstützt.' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    console.info('[reset-password] Request received. Token present:', !!token);

    if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
      console.warn('[reset-password] Invalid request – token or password missing/wrong type.');
      return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: PASSWORD_MIN_LENGTH_MESSAGE },
        { status: 400 },
      );
    }

    // Trim to guard against accidental whitespace in the token value.
    const result = await validatePasswordResetToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.info('[reset-password] Token valid. Proceeding with password reset.');

    const hashed = await bcrypt.hash(password, 12);
    await saveUser({
      ...result.user,
      password: hashed,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });

    console.info('[reset-password] Password reset successful.');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reset-password] Unexpected error:', err);
    return NextResponse.json({ error: 'Passwort-Reset fehlgeschlagen.' }, { status: 500 });
  }
}
