import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAwaitingReviewUsers, getUserById, saveUser, saveAdminLog } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { UserStatus } from '@/types';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Kein Zugang.' }, { status: 403 });
  }

  const users = getAwaitingReviewUsers().map(u => ({ ...u, password: '[HIDDEN]' }));
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Kein Zugang.' }, { status: 403 });
  }

  const { userId, action, note } = await req.json();

  const user = getUserById(userId);
  if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

  const statusMap: Record<string, UserStatus> = {
    approve: 'active',
    question: 'question_to_user',
    postpone: 'postponed',
    delete: 'deleted',
  };

  const newStatus = statusMap[action];
  if (!newStatus) return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 });

  await saveUser({
    ...user,
    status: newStatus,
    active: newStatus === 'active',
    adminNote: note || user.adminNote,
  });

  await saveAdminLog({
    id: `log-${generateId()}`,
    adminId: session.user.id,
    action: `vorstellung_${action}`,
    targetType: 'user',
    targetId: userId,
    note: note || '',
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
