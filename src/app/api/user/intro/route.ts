import { NextRequest, NextResponse } from 'next/server';
import { getUserById, saveUser } from '@/lib/db';

const MIN_LENGTH = 300;

export async function POST(req: NextRequest) {
  try {
    const { userId, motivation, vorstellung } = await req.json();

    if (!userId || !motivation || !vorstellung) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
    }

    if (motivation.trim().length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `Das Motivationsfeld muss mindestens ${MIN_LENGTH} Zeichen enthalten.` },
        { status: 400 }
      );
    }

    if (vorstellung.trim().length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `Das Vorstellungsfeld muss mindestens ${MIN_LENGTH} Zeichen enthalten.` },
        { status: 400 }
      );
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });
    }

    if (user.status !== 'email_verified' && user.status !== 'question_to_user') {
      return NextResponse.json(
        { error: 'Vorstellung kann in diesem Status nicht eingereicht werden.' },
        { status: 400 }
      );
    }

    await saveUser({
      ...user,
      status: 'awaiting_admin_review',
      intro: {
        motivation: motivation.trim(),
        vorstellung: vorstellung.trim(),
        submittedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern der Vorstellung.' }, { status: 500 });
  }
}
