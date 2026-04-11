import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getThesen, getForschung, getGebete, getVideos, getAktionen, getBuchempfehlungen, getUserById } from '@/lib/db';
import type { AdminNotification } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  these: 'These',
  forschung: 'Forschungsbeitrag',
  gebet: 'Gebet',
  video: 'Video',
  aktion: 'Aktion',
  buchempfehlung: 'Buchempfehlung',
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const notifications: AdminNotification[] = [];

  // Check account-level admin message
  const user = getUserById(userId);
  if (user?.adminNote && (user.status === 'question_to_user' || user.status === 'postponed')) {
    notifications.push({
      id: `account-${userId}`,
      contentType: 'account',
      contentTypeLabel: 'Konto',
      title: 'Dein Konto',
      status: user.status,
      adminMessage: user.adminNote,
      createdAt: user.createdAt,
    });
  }

  // Collect items with adminMessage for the current user across all content types
  const collectors: Array<{
    type: string;
    items: Array<{ id: string; userId: string; adminMessage?: string; status: string; createdAt: string; title?: string; content?: string }>;
  }> = [
    { type: 'these', items: getThesen() },
    { type: 'forschung', items: getForschung() },
    { type: 'gebet', items: getGebete().map(g => ({ ...g, title: g.content?.substring(0, 60) ?? '' })) },
    { type: 'video', items: getVideos() },
    { type: 'aktion', items: getAktionen() },
    { type: 'buchempfehlung', items: getBuchempfehlungen() },
  ];

  for (const { type, items } of collectors) {
    for (const item of items) {
      if (item.userId === userId && item.adminMessage && item.status === 'question_to_user') {
        notifications.push({
          id: item.id,
          contentType: type,
          contentTypeLabel: TYPE_LABELS[type] ?? type,
          title: item.title ?? item.content?.substring(0, 60) ?? '(Kein Titel)',
          status: item.status,
          adminMessage: item.adminMessage,
          createdAt: item.createdAt,
        });
      }
    }
  }

  return NextResponse.json(notifications);
}
