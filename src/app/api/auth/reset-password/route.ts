import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsers, saveUser } from '@/lib/db';
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE } from '@/lib/password-policy';

function findUserByResetToken(rawToken: string) {
  const normalizedToken = rawToken.trim();
  const users = getUsers();

  console.info('[reset-password] Total users loaded:', users.length, '| Users with reset token:', users.filter(u => u.passwordResetToken).length);

  const user = users.find(u => u.passwordResetToken === normalizedToken);
  if (!user) {
    console.warn('[reset-password] No user found for the provided token.');
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  if (!user.passwordResetExpiry) {
    console.warn('[reset-password] User found but passwordResetExpiry is missing.');
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  const expiryDate = new Date(user.passwordResetExpiry);
  if (isNaN(expiryDate.getTime())) {
    console.error('[reset-password] passwordResetExpiry is not a valid date.');
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  const expired = expiryDate < new Date();
  console.info('[reset-password] Token expiry check – expired:', expired);

  if (expired) {
    console.warn('[reset-password] Token has expired.');
    return { error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' };
  }

  return { user };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim();

  if (!token) {
    return NextResponse.json({ error: 'Token fehlt.' }, { status: 400 });
  }

  const result = findUserByResetToken(token);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
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
    const result = findUserByResetToken(token);
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
