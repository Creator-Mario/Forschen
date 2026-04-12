import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId, sanitizeText } from '@/lib/utils';
import { getCommunityQuestions, saveCommunityQuestion } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const questions = getCommunityQuestions()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(question => ({
      ...question,
      answers: question.answers.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }));

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = sanitizeText(String(body.title ?? ''));
  const content = sanitizeText(String(body.content ?? ''));

  if (!title || !content) {
    return NextResponse.json({ error: 'Titel und Fragestellung dürfen nicht leer sein.' }, { status: 400 });
  }

  const question = {
    id: `frage-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title,
    content,
    createdAt: new Date().toISOString(),
    answers: [],
  };

  try {
    await saveCommunityQuestion(question);
  } catch (err) {
    console.error('[fragestellungen] saveCommunityQuestion failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fragestellung konnte nicht gespeichert werden.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, id: question.id, question });
}
