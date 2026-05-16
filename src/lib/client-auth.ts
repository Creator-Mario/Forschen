import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

const SESSION_RETRY_ATTEMPTS = 5;
const SESSION_RETRY_DELAY_MS = 10;

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function waitForSessionAfterSignIn(): Promise<Session | null> {
  for (let attempt = 0; attempt < SESSION_RETRY_ATTEMPTS; attempt += 1) {
    const session = await getSession();

    if (session?.user?.role) {
      return session;
    }

    if (attempt < SESSION_RETRY_ATTEMPTS - 1) {
      await wait(SESSION_RETRY_DELAY_MS);
    }
  }

  return null;
}
