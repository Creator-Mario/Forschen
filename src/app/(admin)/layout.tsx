import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import AdminLayoutClient from '@/app/(admin)/AdminLayoutClient';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'Admin-Bereich',
  'Geschützter Administrationsbereich von Der Fluss des Lebens.',
  '/admin',
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
