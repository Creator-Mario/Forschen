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

    const baseUrl = process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      // No base URL configured – fall back to demo mode (token shown on page)
      return NextResponse.json({ success: true, emailToken });
    }
    const emailSent = await sendVerificationEmail(email, emailToken, baseUrl);

    if (emailSent) {
      // Email sent via SMTP – do not expose token in the response
      return NextResponse.json({ success: true });
    }

    // Fallback: no SMTP configured – return token for on-screen demo link
    return NextResponse.json({ success: true, emailToken });
  } catch {
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }
}
