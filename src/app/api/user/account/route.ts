import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, deleteUserAccount } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: 'Passwort ist erforderlich.' }, { status: 400 });
  }

  const user = getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  // Admins may not self-delete via this endpoint to prevent accidental lockout.
  if (user.role === 'ADMIN') {
    return NextResponse.json(
      { error: 'Administratoren können ihr Konto nicht selbst löschen.' },
      { status: 403 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Das Passwort ist falsch.' }, { status: 400 });

  await deleteUserAccount(user.id);

  return NextResponse.json({ success: true });
}
