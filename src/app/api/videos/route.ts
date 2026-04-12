import { NextRequest, NextResponse } from 'next/server';
import { getApprovedVideos, getVideos, saveVideo } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId, sanitizeText } from '@/lib/utils';
import type { ContentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const filterWochenthemaId = searchParams.get('wochenthemaId');
  const mineOnly = searchParams.get('mine');

  console.info('[videos] GET', { all: !!searchParams.get('all'), mine: !!mineOnly, wochenthemaId: filterWochenthemaId });

  let videos: ReturnType<typeof getVideos>;

  if (mineOnly) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    videos = getVideos().filter(v => v.userId === session.user.id);
  } else if (searchParams.get('all')) {
    if (session?.user.role === 'ADMIN') {
      videos = getVideos();
    } else if (session) {
      const userId = session.user.id;
      videos = getVideos().filter(v => v.userId === userId || v.status === 'approved' || v.status === 'published');
    } else {
      videos = getApprovedVideos();
    }
  } else {
    videos = getApprovedVideos();
  }

  if (filterWochenthemaId) {
    videos = videos.filter(v => v.wochenthemaId === filterWochenthemaId);
  }

  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = sanitizeText(String(body.title ?? ''));
  const description = sanitizeText(String(body.description ?? ''));

  console.info('[videos] POST', { title, userId: session.user.id, wochenthemaId: body.wochenthemaId ?? null });

  if (!title || !description) {
    return NextResponse.json({ error: 'Titel und Beschreibung sind erforderlich.' }, { status: 400 });
  }

  // Validate that the video URL uses http or https to prevent javascript: injection.
  const rawUrl = String(body.url ?? '').trim();
  if (!rawUrl.startsWith('https://') && !rawUrl.startsWith('http://')) {
    return NextResponse.json({ error: 'Ungültige Video-URL.' }, { status: 400 });
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = new URL(rawUrl).toString();
  } catch {
    return NextResponse.json({ error: 'Ungültige Video-URL.' }, { status: 400 });
  }

  const video = {
    id: `video-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title,
    description,
    url: normalizedUrl,
    ...(body.wochenthemaId ? { wochenthemaId: String(body.wochenthemaId) } : {}),
    status: (session.user.role === 'ADMIN' ? 'published' : 'review') as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  try {
    await saveVideo(video);
  } catch (err) {
    console.error('[videos] saveVideo failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Video konnte nicht gespeichert werden.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, id: video.id });
}
