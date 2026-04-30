import type { ReactNode } from 'react';

export const revalidate = 300;

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
