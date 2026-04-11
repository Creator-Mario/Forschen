import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getThesen, saveThese,
  getForschung, saveForschung,
  getGebete, saveGebet,
  getVideos, saveVideo,
  getAktionen, saveAktion,
  getUserById,
  deleteContentItem,
  saveAdminLog,
} from '@/lib/db';
import { sendAdminMessageEmail } from '@/lib/email';
import { generateId } from '@/lib/utils';
import type { ContentStatus } from '@/types';

const ALLOWED_STATUSES: ContentStatus[] = [
  'created', 'review', 'published', 'question_to_user', 'postponed', 'deleted',
  'approved', 'rejected', 'pending',
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  these: 'These',
  forschung: 'Forschungsbeitrag',
  gebet: 'Gebet',
  video: 'Video',
  aktion: 'Aktion',
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id, status, moderatorNote, adminMessage } = await req.json();

  // Hard delete: physically remove the item from the database.
  if (status === 'hard_delete') {
    const validTypes = ['these', 'forschung', 'gebet', 'video', 'aktion'] as const;
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
    try {
      const removed = await deleteContentItem(type, id);
      if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await saveAdminLog({
        id: `log-${generateId()}`,
        adminId: session.user.id,
        action: 'hard_delete',
        targetType: type,
        targetId: id,
        note: moderatorNote || adminMessage || undefined,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Hard delete failed' }, { status: 500 });
    }
  }

  if (!ALLOWED_STATUSES.includes(status as ContentStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    let affectedUserId: string | undefined;

    switch (type) {
      case 'these': {
        const list = getThesen();
        const item = list.find(t => t.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        affectedUserId = item.userId;
        await saveThese({ ...item, status, moderatorNote, adminMessage, updatedAt: new Date().toISOString() });
        break;
      }
      case 'forschung': {
        const list = getForschung();
        const item = list.find(f => f.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        affectedUserId = item.userId;
        await saveForschung({ ...item, status, adminMessage, updatedAt: new Date().toISOString() });
        break;
      }
      case 'gebet': {
        const list = getGebete();
        const item = list.find(g => g.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        affectedUserId = item.userId;
        await saveGebet({ ...item, status, adminMessage, updatedAt: new Date().toISOString() });
        break;
      }
      case 'video': {
        const list = getVideos();
        const item = list.find(v => v.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        affectedUserId = item.userId;
        await saveVideo({ ...item, status, adminMessage, updatedAt: new Date().toISOString() });
        break;
      }
      case 'aktion': {
        const list = getAktionen();
        const item = list.find(a => a.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        affectedUserId = item.userId;
        await saveAktion({ ...item, status, adminMessage, updatedAt: new Date().toISOString() });
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

    // Send email notification when admin asks the user a question (non-fatal).
    if (status === 'question_to_user' && adminMessage && affectedUserId) {
      const user = getUserById(affectedUserId);
      if (user?.email) {
        try {
          await sendAdminMessageEmail(
            user.email,
            user.name,
            CONTENT_TYPE_LABELS[type] ?? type,
            adminMessage,
          );
        } catch (err) {
          console.error('[moderate] Email notification could not be sent:', err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Moderation failed' }, { status: 500 });
  }
}

