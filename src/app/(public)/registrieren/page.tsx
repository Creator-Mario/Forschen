import type { Metadata } from 'next';

import RegistrierenPageClient from '@/app/(public)/registrieren/RegistrierenPageClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Registrieren',
  'Registrierungsseite für neue Mitglieder von Der Fluss des Lebens.',
  '/registrieren',
);

export default function RegistrierenPage() {
  return <RegistrierenPageClient />;
}
