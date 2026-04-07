'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (requireAdmin && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, status, router, requireAdmin]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (!session) return null;
  if (requireAdmin && session.user.role !== 'ADMIN') return null;

  return <>{children}</>;
}
