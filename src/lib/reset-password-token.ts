import { getUsersFresh } from '@/lib/db';

export async function validatePasswordResetToken(rawToken: string) {
  const normalizedToken = rawToken.trim();
  const users = await getUsersFresh();

  const user = users.find(u => u.passwordResetToken === normalizedToken);
  if (!user) {
    console.warn('[reset-password] No user found for the provided token.');
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  if (!user.passwordResetExpiry) {
    console.warn('[reset-password] User found but passwordResetExpiry is missing.');
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  const expiryDate = new Date(user.passwordResetExpiry);
  if (isNaN(expiryDate.getTime())) {
    console.error('[reset-password] passwordResetExpiry is not a valid date.');
    return { error: 'Ungültiger oder abgelaufener Link.' };
  }

  const expired = expiryDate < new Date();
  console.info('[reset-password] Token expiry check – expired:', expired);

  if (expired) {
    console.warn('[reset-password] Token has expired.');
    return { error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' };
  }

  return { user };
}
