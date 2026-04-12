import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, saveUser } from '@/lib/db';
import { generateId, normalizeEmail } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE } from '@/lib/password-policy';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, weeklyFaithEmailEnabled } = await req.json();
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const wantsWeeklyFaithEmail = weeklyFaithEmailEnabled === true;

    if (!normalizedName || !normalizedEmail || !password) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({ error: PASSWORD_MIN_LENGTH_MESSAGE }, { status: 400 });
    }

    // Check if user exists
    const existing = getUserByEmail(normalizedEmail);
    if (existing) {
      // If the user registered but never confirmed their email, resend the verification.
      // For any other status (already verified, active, etc.) silently return success
      // to avoid leaking whether an account exists.
      if (existing.status === 'pending_email') {
        const previousToken = existing.emailToken;
        const newEmailToken = crypto.randomBytes(32).toString('hex');
        try {
          await saveUser({ ...existing, emailToken: newEmailToken });
        } catch (err) {
          console.error('[register] resend saveUser failed:', err);
          return NextResponse.json({ error: err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.' }, { status: 500 });
        }
        const emailSent = await sendVerificationEmail(normalizedEmail, newEmailToken);
        if (!emailSent) {
          if (previousToken) {
            try {
              await saveUser({ ...existing, emailToken: previousToken });
            } catch (restoreErr) {
              console.error('[register] failed to restore previous email token:', restoreErr);
            }
          }
          console.error('[register] Could not resend verification email to pending user.');
          return NextResponse.json(
            { error: 'Bestätigungs-E-Mail konnte nicht versendet werden. Bitte versuche es erneut.' },
            { status: 503 },
          );
        }
        console.info('[register] Verification email resent to pending user.');
      }
      return NextResponse.json({ success: true });
    }

    const hashed = await bcrypt.hash(password, 12);
    const emailToken = crypto.randomBytes(32).toString('hex');

    try {
      await saveUser({
        id: `user-${generateId()}`,
        email: normalizedEmail,
        password: hashed,
        name: normalizedName,
        role: 'USER',
        status: 'pending_email',
        createdAt: new Date().toISOString(),
        active: false,
        emailToken,
        weeklyFaithEmailEnabled: wantsWeeklyFaithEmail,
        weeklyFaithEmailUpdatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[register] saveUser failed:', err);
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.' }, { status: 500 });
    }

    const emailSent = await sendVerificationEmail(normalizedEmail, emailToken);

    if (emailSent) {
      console.info('[register] Verification email sent successfully.');
    } else {
      console.error('[register] Verification email could not be sent.');
      return NextResponse.json(
        { error: 'Bestätigungs-E-Mail konnte nicht versendet werden. Bitte versuche es erneut.' },
        { status: 503 },
      );
    }

    // Never expose the token in the response – email is the only delivery channel.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }
}
