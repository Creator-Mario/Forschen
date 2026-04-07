import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUser } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomBytes, timingSafeEqual } from 'crypto';

export async function POST(req: NextRequest) {
  const resetToken = process.env.ADMIN_RESET_TOKEN;

  // Feature is disabled when no token is configured
  if (!resetToken) {
    return NextResponse.json(
      { error: 'Passwort-Reset ist nicht konfiguriert.' },
      { status: 503 }
    );
  }

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  // Constant-time comparison to prevent timing attacks
  const provided = Buffer.from(body.token ?? '');
  const expected = Buffer.from(resetToken);
  const valid =
    provided.length === expected.length &&
    timingSafeEqual(provided, expected);

  if (!valid) {
    return NextResponse.json({ error: 'Ungültiger Reset-Token.' }, { status: 401 });
  }

  // Find the admin account
  const users = getUsers();
  const admin = users.find(u => u.role === 'ADMIN');
  if (!admin) {
    return NextResponse.json({ error: 'Kein Admin-Konto gefunden.' }, { status: 404 });
  }

  // Generate a cryptographically random one-time password (16 bytes = 128 bits of entropy)
  const oneTimePassword = randomBytes(16).toString('hex'); // 32 hex chars
  const hashed = await bcrypt.hash(oneTimePassword, 12);

  await saveUser({ ...admin, password: hashed });

  return NextResponse.json({
    success: true,
    oneTimePassword,
    email: admin.email,
    message: 'Passwort wurde zurückgesetzt. Bitte sofort nach dem Login ändern.',
  });
}
