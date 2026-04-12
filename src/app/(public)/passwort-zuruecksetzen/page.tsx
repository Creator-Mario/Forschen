import type { Metadata } from 'next';

import PasswortZuruecksetzenPageClient from '@/app/(public)/passwort-zuruecksetzen/PasswortZuruecksetzenPageClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Passwort zurücksetzen',
  'Seite zum sicheren Zurücksetzen eines Passworts.',
  '/passwort-zuruecksetzen',
);

export default function PasswortZuruecksetzenPage() {
  return <PasswortZuruecksetzenPageClient />;
}
