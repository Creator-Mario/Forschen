import { NextRequest, NextResponse } from 'next/server';
import { getApprovedVideos, getVideos, saveVideo } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';

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
  try {
    const parsed = new URL(body.url ?? '');
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return NextResponse.json({ error: 'Ungültige Video-URL.' }, { status: 400 });
    }
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
    status: 'created' as const,
    createdAt: new Date().toISOString(),
  };
  await saveVideo(video);
  return NextResponse.json({ success: true, id: video.id });
}
