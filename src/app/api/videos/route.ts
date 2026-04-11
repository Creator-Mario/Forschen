import { NextRequest, NextResponse } from 'next/server';
import { getApprovedVideos, getVideos, saveVideo } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';
import type { ContentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  if (searchParams.get('all')) {
    if (session?.user.role === 'ADMIN') {
      return NextResponse.json(getVideos());
    }
    if (session) {
      const userId = session.user.id;
      return NextResponse.json(
        getVideos().filter(v => v.userId === userId || v.status === 'approved' || v.status === 'published')
      );
    }
  }
  return NextResponse.json(getApprovedVideos());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Validate that the video URL uses http or https to prevent javascript: injection.
  const rawUrl: string = body.url ?? '';
  if (!rawUrl.startsWith('https://') && !rawUrl.startsWith('http://')) {
    return NextResponse.json({ error: 'Ungültige Video-URL.' }, { status: 400 });
  }
  try {
    new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Ungültige Video-URL.' }, { status: 400 });
  }

  const video = {
    id: `video-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title: body.title,
    description: body.description,
    url: body.url,
    status: (session.user.role === 'ADMIN' ? 'published' : 'created') as ContentStatus,
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
