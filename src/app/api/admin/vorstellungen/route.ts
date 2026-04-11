import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAwaitingReviewUsers, getUserById, saveUser, saveAdminLog, deleteUserAccount } from '@/lib/db';
import { sendAdminApprovalEmail, sendEmail, escHtml } from '@/lib/email';
import { generateId } from '@/lib/utils';
import { siteName, siteDomain } from '@/lib/config';
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

  try {
    const { userId, action, note } = await req.json();

    console.info('[vorstellungen] PATCH', { userId, action });

    const user = getUserById(userId);
    if (!user) return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });

    // 'delete' permanently removes the user and all their data from the database.
    if (action === 'delete') {
      // Notify the user before deletion so email is still accessible.
      try {
        await sendEmail({
          to: user.email,
          subject: `Deine Registrierung – ${siteName}`,
          text: `Hallo ${user.name},\n\nleider können wir deine Registrierung bei „${siteName}" nicht freischalten.${note ? `\n\nHinweis des Administrators: ${note}` : ''}\n\nWenn du Fragen hast, kannst du uns jederzeit kontaktieren.\n\n${siteName}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
              <h2 style="color:#1e3a8a;margin-bottom:16px;">Deine Registrierung</h2>
              <p style="color:#374151;line-height:1.6;">Hallo ${escHtml(user.name)},</p>
              <p style="color:#374151;line-height:1.6;">
                leider können wir deine Registrierung bei <strong>${escHtml(siteName)}</strong>
                nicht freischalten.
              </p>
              ${note ? `<blockquote style="border-left:4px solid #d1d5db;padding:12px 16px;margin:16px 0;background:#f9fafb;color:#374151;border-radius:0 8px 8px 0;">${escHtml(note)}</blockquote>` : ''}
              <p style="color:#374151;line-height:1.6;">
                Wenn du Fragen hast, kannst du uns jederzeit kontaktieren.
              </p>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${escHtml(siteName)} · ${escHtml(siteDomain)}</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('[vorstellungen] Delete notification email could not be sent:', err);
      }

      await deleteUserAccount(userId);

      await saveAdminLog({
        id: `log-${generateId()}`,
        adminId: session.user.id,
        action: 'vorstellung_delete',
        targetType: 'user',
        targetId: userId,
        note: note || '',
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    const statusMap: Record<string, UserStatus> = {
      approve: 'active',
      question: 'question_to_user',
      postpone: 'postponed',
    };

    const newStatus = statusMap[action];
    if (!newStatus) return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 });

    await saveUser({
      ...user,
      status: newStatus,
      active: newStatus === 'active',
      adminNote: note || user.adminNote,
    });

    // Send email notifications for relevant actions (errors are non-fatal).
    try {
      if (action === 'approve') {
        await sendAdminApprovalEmail(user.email, user.name, true, note || undefined);
      } else if (action === 'question' && note) {
        await sendAdminApprovalEmail(user.email, user.name, false, note);
      }
    } catch (err) {
      console.error('[vorstellungen] Email notification could not be sent:', err);
    }

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
  } catch (err) {
    console.error('[vorstellungen] PATCH failed:', err);
    return NextResponse.json({ error: 'Aktion fehlgeschlagen. Bitte erneut versuchen.' }, { status: 500 });
  }
}
