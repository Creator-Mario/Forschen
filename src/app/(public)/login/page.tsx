import type { Metadata } from 'next';

import LoginPageClient from '@/app/(public)/login/LoginPageClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Anmelden',
  'Anmeldeseite für Mitglieder von Der Fluss des Lebens.',
  '/login',
);

export default function LoginPage() {
  return <LoginPageClient />;
}
