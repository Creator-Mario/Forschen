import type { Metadata } from 'next';

import VorstellungenPageClient from '@/app/(public)/mitglieder/vorstellungen/VorstellungenPageClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Mitglieder-Vorstellungen',
  'Geschützter Vorstellungsbereich für freigeschaltete Mitglieder.',
  '/mitglieder/vorstellungen',
);

export default function VorstellungenPage() {
  return <VorstellungenPageClient />;
}
