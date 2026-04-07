export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getThesen, saveThese,
  getForschung, saveForschung,
  getGebete, saveGebet,
  getVideos, saveVideo,
  getAktionen, saveAktion,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id, status, moderatorNote } = await req.json();

  try {
    switch (type) {
      case 'these': {
        const list = getThesen();
        const item = list.find(t => t.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        saveThese({ ...item, status, moderatorNote, updatedAt: new Date().toISOString() });
        break;
      }
      case 'forschung': {
        const list = getForschung();
        const item = list.find(f => f.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        saveForschung({ ...item, status });
        break;
      }
      case 'gebet': {
        const list = getGebete();
        const item = list.find(g => g.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        saveGebet({ ...item, status });
        break;
      }
      case 'video': {
        const list = getVideos();
        const item = list.find(v => v.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        saveVideo({ ...item, status });
        break;
      }
      case 'aktion': {
        const list = getAktionen();
        const item = list.find(a => a.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        saveAktion({ ...item, status });
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Moderation failed' }, { status: 500 });
  }
}
