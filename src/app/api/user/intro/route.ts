import { NextRequest, NextResponse } from 'next/server';
import { getUserById, saveUser } from '@/lib/db';
import { sendEmail } from '@/lib/email';

const MIN_LENGTH = 300;

export async function POST(req: NextRequest) {
  try {
    const { userId, motivation, vorstellung } = await req.json();

    if (!userId || !motivation || !vorstellung) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
    }

    if (motivation.trim().length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `Das Motivationsfeld muss mindestens ${MIN_LENGTH} Zeichen enthalten.` },
        { status: 400 }
      );
    }

    if (vorstellung.trim().length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `Das Vorstellungsfeld muss mindestens ${MIN_LENGTH} Zeichen enthalten.` },
        { status: 400 }
      );
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });
    }

    if (user.status !== 'email_verified' && user.status !== 'question_to_user') {
      return NextResponse.json(
        { error: 'Vorstellung kann in diesem Status nicht eingereicht werden.' },
        { status: 400 }
      );
    }

    await saveUser({
      ...user,
      status: 'awaiting_admin_review',
      intro: {
        motivation: motivation.trim(),
        vorstellung: vorstellung.trim(),
        submittedAt: new Date().toISOString(),
      },
    });

    // Notify admin that a new user is awaiting review.
    const adminEmail = process.env.MAIL_REPLY_TO;
    if (adminEmail) {
      const siteName = process.env.MAIL_FROM_NAME ?? 'Der Fluss des Lebens';
      const siteDomain = process.env.SITE_DOMAIN ?? 'flussdeslebens.live';
      const baseUrl = process.env.NEXTAUTH_URL ?? `https://${siteDomain}`;
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Neue Vorstellung zur Prüfung – ${siteName}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
              <h2 style="color:#1e3a8a;margin-bottom:16px;">Neue Vorstellung zur Prüfung</h2>
              <p style="color:#374151;line-height:1.6;">
                Ein neues Mitglied hat seine Vorstellung eingereicht und wartet auf Freischaltung.
              </p>
              <table style="font-size:14px;color:#4b5563;border-collapse:collapse;width:100%;margin:16px 0;">
                <tr>
                  <td style="padding:6px 8px;font-weight:600;white-space:nowrap;">Name</td>
                  <td style="padding:6px 8px;">${user.name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:6px 8px;font-weight:600;white-space:nowrap;">E-Mail</td>
                  <td style="padding:6px 8px;">${user.email.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
                </tr>
              </table>
              <a href="${baseUrl}/admin"
                 style="display:inline-block;margin:16px 0;background:#1e40af;color:#fff;
                        text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
                Zum Admin-Bereich
              </a>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${siteName} · ${siteDomain}</p>
            </div>
          `,
          text: `Neue Vorstellung zur Prüfung\n\nName: ${user.name}\nE-Mail: ${user.email}\n\nBitte melde dich im Admin-Bereich: ${baseUrl}/admin`,
        });
      } catch (err) {
        console.error('[intro] Admin notification email could not be sent:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern der Vorstellung.' }, { status: 500 });
  }
}
