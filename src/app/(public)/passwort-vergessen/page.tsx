import type { Metadata } from 'next';

import PasswortVergessenPageClient from '@/app/(public)/passwort-vergessen/PasswortVergessenPageClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Passwort vergessen',
  'Seite zum Anfordern eines Passwort-Reset-Links für Mitglieder.',
  '/passwort-vergessen',
);

export default function PasswortVergessenPage() {
  return <PasswortVergessenPageClient />;
}
