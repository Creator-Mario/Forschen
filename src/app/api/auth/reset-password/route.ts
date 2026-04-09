import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsers, saveUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen haben.' },
        { status: 400 },
      );
    }

    const users = getUsers();
    const user = users.find(u => u.passwordResetToken === token);

    if (!user || !user.passwordResetExpiry) {
      return NextResponse.json({ error: 'Ungültiger oder abgelaufener Link.' }, { status: 400 });
    }

    if (new Date(user.passwordResetExpiry) < new Date()) {
      return NextResponse.json({ error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await saveUser({
      ...user,
      password: hashed,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Passwort-Reset fehlgeschlagen.' }, { status: 500 });
  }
}
