import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Mitgliederbereich',
  'Geschützter Mitgliederbereich von Der Fluss des Lebens.',
  '/dashboard',
);

export default function UserLayout({ children }: { children: ReactNode }) {
  return children;
}
