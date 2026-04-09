import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers, saveUser, saveAdminLog, deleteUserAccount } from '@/lib/db';
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
  if (!id || !['lock', 'unlock', 'delete', 'hard_delete'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Prevent admin from modifying their own account
  if (user.id === session.user.id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });
  }

  if (action === 'hard_delete') {
    // Physically remove the user and ALL their content from the database.
    await deleteUserAccount(id);

    await saveAdminLog({
      id: `log-${generateId()}`,
      adminId: session.user.id,
      action: 'user_hard_delete',
      targetType: 'user',
      targetId: id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  }

  if (action === 'lock') {
    user.active = false;
    user.status = 'deleted';
  } else if (action === 'unlock') {
    user.active = true;
    user.status = 'active';
  } else if (action === 'delete') {
    // Soft delete: deactivate the account while keeping the data.
    user.active = false;
    user.status = 'deleted';
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
