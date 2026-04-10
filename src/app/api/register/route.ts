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

    // Check if user exists without revealing this via error message
    const existing = getUserByEmail(email);
    if (existing) {
      // Return success to avoid email enumeration
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
