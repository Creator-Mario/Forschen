import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmailFresh, getUserByIdFresh, saveUser, deleteUserAccount } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { normalizeEmail } from '@/lib/utils';

const MAX_PROFILE_IMAGE_DATA_URL_LENGTH = 1_500_000;
const PROFILE_IMAGE_DATA_URL_PATTERN = /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i;

function looksLikeEmail(value: string): boolean {
  if (!value || value.includes(' ')) return false;
  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) return false;
  const domain = value.slice(atIndex + 1);
  const dotIndex = domain.indexOf('.');
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

function normalizeProfileImage(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new Error('Bitte lade ein gültiges Bild hoch.');
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) return undefined;

  if (!PROFILE_IMAGE_DATA_URL_PATTERN.test(normalizedValue)) {
    throw new Error('Es sind nur PNG, JPG, WEBP oder GIF als Profilbild erlaubt.');
  }

  if (normalizedValue.length > MAX_PROFILE_IMAGE_DATA_URL_LENGTH) {
    throw new Error('Das Profilbild ist zu groß. Bitte wähle eine kleinere Datei.');
  }

  return normalizedValue;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const user = await getUserByIdFresh(session.user.id);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    weeklyFaithEmailEnabled: user.weeklyFaithEmailEnabled === true,
    profileImage: user.profileImage ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { name, email, weeklyFaithEmailEnabled, profileImage } = await req.json();
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
  let normalizedProfileImage: string | undefined;

  if (!normalizedName || !normalizedEmail) {
    return NextResponse.json({ error: 'Name und E-Mail sind erforderlich.' }, { status: 400 });
  }

  if (!looksLikeEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 });
  }

  try {
    normalizedProfileImage = normalizeProfileImage(profileImage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bitte lade ein gültiges Bild hoch.' },
      { status: 400 }
    );
  }

  const user = await getUserByIdFresh(session.user.id);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  const existingUser = await getUserByEmailFresh(normalizedEmail);
  if (existingUser && existingUser.id !== user.id) {
    return NextResponse.json({ error: 'Diese E-Mail-Adresse wird bereits verwendet.' }, { status: 409 });
  }

  const updatedUser = {
    ...user,
    name: normalizedName,
    email: normalizedEmail,
    profileImage: normalizedProfileImage,
    profileImageUpdatedAt:
      user.profileImage === normalizedProfileImage
        ? user.profileImageUpdatedAt
        : new Date().toISOString(),
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
      profileImage: updatedUser.profileImage ?? null,
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

  const user = await getUserByIdFresh(session.user.id);
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
