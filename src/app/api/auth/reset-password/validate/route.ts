import { NextRequest, NextResponse } from 'next/server';

import { getUsers } from '@/lib/db';

function isValidResetToken(token: string) {
  const normalizedToken = token.trim();
  const users = getUsers();
  const user = users.find(entry => entry.passwordResetToken === normalizedToken);

  if (!user || !user.passwordResetExpiry) {
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  const expiryDate = new Date(user.passwordResetExpiry);
  if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
    return { error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' };
  }

  return { success: true };
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token fehlt.' }, { status: 400 });
    }

    const result = isValidResetToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Link-Prüfung fehlgeschlagen.' }, { status: 500 });
  }
}
