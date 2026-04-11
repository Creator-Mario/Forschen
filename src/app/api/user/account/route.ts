import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, getUserById, saveUser, deleteUserAccount } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { normalizeEmail } from '@/lib/utils';

function looksLikeEmail(value: string): boolean {
  if (!value || value.includes(' ')) return false;
  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) return false;
  const domain = value.slice(atIndex + 1);
  const dotIndex = domain.indexOf('.');
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const user = getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    weeklyFaithEmailEnabled: user.weeklyFaithEmailEnabled === true,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { name, email, weeklyFaithEmailEnabled } = await req.json();
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';

  if (!normalizedName || !normalizedEmail) {
    return NextResponse.json({ error: 'Name und E-Mail sind erforderlich.' }, { status: 400 });
  }

  if (!looksLikeEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 });
  }

  const user = getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  const existingUser = getUserByEmail(normalizedEmail);
  if (existingUser && existingUser.id !== user.id) {
    return NextResponse.json({ error: 'Diese E-Mail-Adresse wird bereits verwendet.' }, { status: 409 });
  }

  const updatedUser = {
    ...user,
    name: normalizedName,
    email: normalizedEmail,
    weeklyFaithEmailEnabled: weeklyFaithEmailEnabled === true,
    weeklyFaithEmailUpdatedAt:
      user.weeklyFaithEmailEnabled === (weeklyFaithEmailEnabled === true)
        ? user.weeklyFaithEmailUpdatedAt
        : new Date().toISOString(),
  };

  await saveUser(updatedUser);

  return NextResponse.json({
    success: true,
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      weeklyFaithEmailEnabled: updatedUser.weeklyFaithEmailEnabled === true,
    },
  });
}

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
