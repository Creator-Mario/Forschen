import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, saveUser } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

// Token is valid for 1 hour
const EXPIRY_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-Mail-Adresse fehlt.' }, { status: 400 });
    }

    const user = getUserByEmail(email);

    if (user && user.status !== 'deleted') {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + EXPIRY_MS).toISOString();

      await saveUser({ ...user, passwordResetToken: token, passwordResetExpiry: expiry });

      const sent = await sendPasswordResetEmail(user.email, user.name, token);
      if (!sent) {
        console.error('[forgot-password] Could not send reset email to', email);
      }
    }

    // Always return the same response to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Anfrage fehlgeschlagen.' }, { status: 500 });
  }
}
