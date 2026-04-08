import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers, saveUser, saveAdminLog } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = getUsers().map(u => ({ ...u, password: '[HIDDEN]' }));
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, action } = await req.json();
  if (!id || !['lock', 'unlock', 'delete'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Prevent admin from modifying their own account
  if (user.id === session.user.id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });
  }

  if (action === 'lock') {
    user.active = false;
  } else if (action === 'unlock') {
    user.active = true;
  } else if (action === 'delete') {
    user.active = false;
    user.email = `deleted-${user.id}@deleted`;
  }

  await saveUser(user);

  await saveAdminLog({
    id: `log-${generateId()}`,
    adminId: session.user.id,
    action: `user_${action}`,
    targetType: 'user',
    targetId: id,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
