import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers, saveUser, saveAdminLog, deleteUserAccount } from '@/lib/db';
import { sendEmail, escHtml } from '@/lib/email';
import { generateId } from '@/lib/utils';
import { siteDomain as cfgSiteDomain } from '@/lib/config';

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

  // Capture email and name before any mutation (soft-delete anonymises the email).
  const userEmail = user.email;
  const userName = user.name;
  const siteName = 'Der Fluss des Lebens';
  const siteDomain = cfgSiteDomain;

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

  // Send notification email to the affected user.
  try {
    if (action === 'unlock') {
      await sendEmail({
        to: userEmail,
        subject: `Dein Konto wurde wiederhergestellt – ${siteName}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
            <h2 style="color:#1e3a8a;margin-bottom:16px;">Konto wiederhergestellt</h2>
            <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
            <p style="color:#374151;line-height:1.6;">
              dein Konto bei <strong>${escHtml(siteName)}</strong> wurde vom Administrator wiederhergestellt.
              Du kannst dich jetzt wieder einloggen.
            </p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${siteName} · ${siteDomain}</p>
          </div>
        `,
        text: `Hallo ${userName},\n\ndein Konto bei „${siteName}" wurde vom Administrator wiederhergestellt. Du kannst dich jetzt wieder einloggen.\n\n${siteName}`,
      });
    } else if (action === 'lock') {
      await sendEmail({
        to: userEmail,
        subject: `Dein Konto wurde gesperrt – ${siteName}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
            <h2 style="color:#1e3a8a;margin-bottom:16px;">Konto gesperrt</h2>
            <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(userName)},</p>
            <p style="color:#374151;line-height:1.6;">
              dein Konto bei <strong>${escHtml(siteName)}</strong> wurde vom Administrator gesperrt.
              Falls du Fragen hast, wende dich bitte direkt an uns.
            </p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${siteName} · ${siteDomain}</p>
          </div>
        `,
        text: `Hallo ${userName},\n\ndein Konto bei „${siteName}" wurde vom Administrator gesperrt. Falls du Fragen hast, wende dich bitte direkt an uns.\n\n${siteName}`,
      });
    }
  } catch (err) {
    console.error('[admin/users] Notification email could not be sent for action', action, err);
  }

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
