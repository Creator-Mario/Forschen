import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailTokenFresh, getUserByIdFresh, saveUser } from '@/lib/db';
import { sendEmail, sendRegistrationPendingEmail, escHtml } from '@/lib/email';
import { operatorEmail, canonicalSiteUrl, siteDomain, siteName } from '@/lib/config';
import { getIntroLengthError } from '@/lib/intro-validation';

export async function POST(req: NextRequest) {
  try {
    const { userId, token, motivation, vorstellung } = await req.json();
    const cookieToken = req.cookies.get('intro_verification_token')?.value?.trim();
    const requestToken = typeof token === 'string' ? token.trim() : '';
    const effectiveToken = requestToken || cookieToken;

    if ((!userId && !effectiveToken) || !motivation || !vorstellung) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
    }

    const trimmedMotivation = motivation.trim();
    const trimmedVorstellung = vorstellung.trim();
    const motivationError = getIntroLengthError('Motivationsfeld', trimmedMotivation);
    if (motivationError) return NextResponse.json({ error: motivationError }, { status: 400 });
    const vorstellungError = getIntroLengthError('Vorstellungsfeld', trimmedVorstellung);
    if (vorstellungError) return NextResponse.json({ error: vorstellungError }, { status: 400 });

    const user = effectiveToken
      ? await getUserByEmailTokenFresh(effectiveToken)
      : await getUserByIdFresh(userId);
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
      emailToken: undefined,
      intro: {
        motivation: trimmedMotivation,
        vorstellung: trimmedVorstellung,
        submittedAt: new Date().toISOString(),
      },
    });

    // Notify admin that a new user is awaiting review.
    if (operatorEmail) {
      try {
        const adminReviewUrl = `${canonicalSiteUrl}/admin/vorstellungen`;

        await sendEmail({
          to: operatorEmail,
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
                  <td style="padding:6px 8px;">${escHtml(user.name)}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:6px 8px;font-weight:600;white-space:nowrap;">E-Mail</td>
                  <td style="padding:6px 8px;">${escHtml(user.email)}</td>
                </tr>
              </table>
              <div style="margin:20px 0;">
                <h3 style="color:#1e3a8a;margin:0 0 8px;">Motivation</h3>
                <div style="white-space:pre-wrap;background:#f9fafb;border-radius:8px;padding:12px 14px;color:#374151;">
                  ${escHtml(trimmedMotivation)}
                </div>
              </div>
              <div style="margin:20px 0;">
                <h3 style="color:#1e3a8a;margin:0 0 8px;">Vorstellung</h3>
                <div style="white-space:pre-wrap;background:#f9fafb;border-radius:8px;padding:12px 14px;color:#374151;">
                  ${escHtml(trimmedVorstellung)}
                </div>
              </div>
              <a href="${adminReviewUrl}"
                 style="display:inline-block;margin:16px 0;background:#1e40af;color:#fff;
                        text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
                Vorstellungen prüfen
              </a>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">${siteName} · ${siteDomain}</p>
            </div>
          `,
          text: `Neue Vorstellung zur Prüfung\n\nName: ${user.name}\nE-Mail: ${user.email}\n\nMotivation:\n${trimmedMotivation}\n\nVorstellung:\n${trimmedVorstellung}\n\nBitte prüfe die Vorstellung hier: ${adminReviewUrl}`,
        });
      } catch (err) {
        console.error('[intro] Admin notification email could not be sent:', err);
      }
    }

    // Confirm receipt to the user.
    try {
      await sendRegistrationPendingEmail(user.email, user.name);
    } catch (err) {
      console.error('[intro] User confirmation email could not be sent:', err);
    }

    const response = NextResponse.json({ success: true });
    if (cookieToken) {
      response.cookies.set('intro_verification_token', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: new Date(0),
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern der Vorstellung.' }, { status: 500 });
  }
}
