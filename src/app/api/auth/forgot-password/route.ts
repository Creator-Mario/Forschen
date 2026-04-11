import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, saveUser } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { normalizeEmail } from '@/lib/utils';

// Token is valid for 1 hour
const EXPIRY_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'E-Mail-Adresse fehlt.' }, { status: 400 });
    }

    const user = getUserByEmail(normalizedEmail);

    if (user && user.status !== 'deleted') {
      const previousToken = user.passwordResetToken;
      const previousExpiry = user.passwordResetExpiry;
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + EXPIRY_MS).toISOString();

      await saveUser({ ...user, passwordResetToken: token, passwordResetExpiry: expiry });

      console.info('[forgot-password] Sending password-reset email.');
      const sent = await sendPasswordResetEmail(user.email, user.name, token);
      if (sent) {
        console.info('[forgot-password] Password-reset email sent successfully.');
      } else {
        console.error('[forgot-password] Failed to send reset email.');
        await saveUser({
          ...user,
          passwordResetToken: previousToken,
          passwordResetExpiry: previousExpiry,
        });
        return NextResponse.json(
          { error: 'E-Mail zum Zurücksetzen konnte nicht versendet werden. Bitte versuche es erneut.' },
          { status: 503 },
        );
      }
    } else {
      // Do not log the email address to avoid exposing whether an account exists.
      console.info('[forgot-password] Reset email skipped – no matching active account.');
    }

    // Always return the same response to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[forgot-password] Unexpected error:', err);
    return NextResponse.json({ error: 'Anfrage fehlgeschlagen.' }, { status: 500 });
  }
}
