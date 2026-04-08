import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, saveUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Das neue Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 });
  }

  const user = getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: 'Das aktuelle Passwort ist falsch.' }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await saveUser({ ...user, password: hashed });

  return NextResponse.json({ success: true });
}
