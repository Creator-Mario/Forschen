import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, saveUser } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Das Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 });
    }

    // Check if user exists
    const existing = getUserByEmail(email);
    if (existing) {
      // If the user registered but never confirmed their email, resend the verification.
      // For any other status (already verified, active, etc.) silently return success
      // to avoid leaking whether an account exists.
      if (existing.status === 'pending_email') {
        const newEmailToken = crypto.randomBytes(32).toString('hex');
        try {
          await saveUser({ ...existing, emailToken: newEmailToken });
        } catch (err) {
          console.error('[register] resend saveUser failed:', err);
          return NextResponse.json({ error: err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.' }, { status: 500 });
        }
        const emailSent = await sendVerificationEmail(email, newEmailToken);
        if (emailSent) {
          console.info('[register] Verification email resent to pending user.');
        } else {
          console.error('[register] Could not resend verification email to pending user.');
        }
      }
      return NextResponse.json({ success: true });
    }

    const hashed = await bcrypt.hash(password, 12);
    const emailToken = crypto.randomBytes(32).toString('hex');

    try {
      await saveUser({
        id: `user-${generateId()}`,
        email,
        password: hashed,
        name,
        role: 'USER',
        status: 'pending_email',
        createdAt: new Date().toISOString(),
        active: false,
        emailToken,
      });
    } catch (err) {
      console.error('[register] saveUser failed:', err);
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.' }, { status: 500 });
    }

    const emailSent = await sendVerificationEmail(email, emailToken);

    if (emailSent) {
      console.info('[register] Verification email sent successfully.');
    } else {
      console.error('[register] Verification email could not be sent.');
    }

    // Never expose the token in the response – email is the only delivery channel.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }
}
