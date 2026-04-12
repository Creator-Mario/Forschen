import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId, sanitizeText } from '@/lib/utils';
import { getCommunityQuestionById, saveCommunityQuestion } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { questionId } = await params;
  const question = getCommunityQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: 'Fragestellung nicht gefunden.' }, { status: 404 });
  }

  const body = await req.json();
  const content = sanitizeText(String(body.content ?? ''));
  if (!content) {
    return NextResponse.json({ error: 'Antwort darf nicht leer sein.' }, { status: 400 });
  }

  const updatedQuestion = {
    ...question,
    updatedAt: new Date().toISOString(),
    answers: [
      ...question.answers,
      {
        id: `antwort-${generateId()}`,
        userId: session.user.id,
        authorName: session.user.name,
        content,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  try {
    await saveCommunityQuestion(updatedQuestion);
  } catch (err) {
    console.error('[fragestellungen] saveCommunityQuestion(answer) failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Antwort konnte nicht gespeichert werden.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, question: updatedQuestion });
}
