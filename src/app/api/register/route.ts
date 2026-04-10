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

    const baseUrl =
      process.env.NEXTAUTH_URL ??
      `https://${process.env.SITE_DOMAIN ?? 'flussdeslebens.live'}`;

    try {
      await sendVerificationEmail(email, emailToken, baseUrl);
      console.log('Verification email sent successfully');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return NextResponse.json({ success: false, error: error.message || 'Email send failed' }, { status: 500 });
    }

    // Never expose the token in the response – email is the only delivery channel.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }
}
