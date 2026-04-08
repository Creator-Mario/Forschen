import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getThesen, saveThese,
  getForschung, saveForschung,
  getGebete, saveGebet,
  getVideos, saveVideo,
  getAktionen, saveAktion,
  saveAdminLog,
} from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { ContentStatus } from '@/types';

const ALLOWED_STATUSES: ContentStatus[] = [
  'created', 'review', 'published', 'question_to_user', 'postponed', 'deleted',
  'approved', 'rejected', 'pending',
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id, status, moderatorNote, adminMessage } = await req.json();

  if (!ALLOWED_STATUSES.includes(status as ContentStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'these': {
        const list = getThesen();
        const item = list.find(t => t.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await saveThese({ ...item, status, moderatorNote, adminMessage, updatedAt: new Date().toISOString() });
        break;
      }
      case 'forschung': {
        const list = getForschung();
        const item = list.find(f => f.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await saveForschung({ ...item, status, adminMessage });
        break;
      }
      case 'gebet': {
        const list = getGebete();
        const item = list.find(g => g.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await saveGebet({ ...item, status, adminMessage });
        break;
      }
      case 'video': {
        const list = getVideos();
        const item = list.find(v => v.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await saveVideo({ ...item, status, adminMessage });
        break;
      }
      case 'aktion': {
        const list = getAktionen();
        const item = list.find(a => a.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await saveAktion({ ...item, status, adminMessage });
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }

    // Mandatory admin action log
    await saveAdminLog({
      id: `log-${generateId()}`,
      adminId: session.user.id,
      action: status,
      targetType: type,
      targetId: id,
      note: moderatorNote || adminMessage || undefined,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Moderation failed' }, { status: 500 });
  }
}

