export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { getApprovedVideos, getVideos, saveVideo } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let session = null;
  try { session = await getServerSession(authOptions); } catch { /* static build */ }
  if (searchParams.get('all') && session?.user.role === 'ADMIN') {
    return NextResponse.json(getVideos());
  }
  return NextResponse.json(getApprovedVideos());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const video = {
    id: `video-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title: body.title,
    description: body.description,
    url: body.url,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  saveVideo(video);
  return NextResponse.json({ success: true, id: video.id });
}
