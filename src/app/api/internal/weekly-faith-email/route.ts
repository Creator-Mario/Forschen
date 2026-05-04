import { NextResponse } from 'next/server';
import { getCurrentWochenthemaFresh, getUsersFresh, saveUser } from '@/lib/db';
import { sendWeeklyFaithEmail } from '@/lib/email';

function getSecretCandidates(headerValue: string | null): string[] {
  const trimmedValue = headerValue?.trim();
  if (!trimmedValue) {
    return [];
  }

  const bearerStrippedValue = trimmedValue.replace(/^Bearer\s+/i, '').trim();

  return bearerStrippedValue && bearerStrippedValue !== trimmedValue
    ? [trimmedValue, bearerStrippedValue]
    : [trimmedValue];
}

function getProvidedSecrets(req: Request): string[] {
  return [
    req.headers.get('x-weekly-faith-email-secret'),
    req.headers.get('x-cron-secret'),
    req.headers.get('authorization'),
  ].flatMap(getSecretCandidates);
}

export async function POST(req: Request) {
  const expectedSecret = process.env.WEEKLY_FAITH_EMAIL_CRON_SECRET?.trim();
  const providedSecrets = getProvidedSecrets(req);

  if (!expectedSecret) {
    return NextResponse.json({ error: 'WEEKLY_FAITH_EMAIL_CRON_SECRET fehlt.' }, { status: 503 });
  }

  if (!providedSecrets.some(secret => secret === expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const theme = await getCurrentWochenthemaFresh();
  if (!theme) {
    return NextResponse.json({ error: 'Kein veröffentlichtes Wochenthema gefunden.' }, { status: 404 });
  }

  const recipients = (await getUsersFresh()).filter(user =>
    user.role !== 'ADMIN' &&
    user.status === 'active' &&
    user.active &&
    user.weeklyFaithEmailEnabled === true &&
    user.lastWeeklyFaithEmailWeek !== theme.week
  );

  let sent = 0;
  const failed: string[] = [];

  for (const user of recipients) {
    const success = await sendWeeklyFaithEmail(user.email, user.name, theme);
    if (!success) {
      failed.push(user.email);
      continue;
    }

    await saveUser({
      ...user,
      lastWeeklyFaithEmailWeek: theme.week,
    });
    sent += 1;
  }

  return NextResponse.json({
    week: theme.week,
    theme: theme.title,
    recipients: recipients.length,
    sent,
    failed,
  });
}
