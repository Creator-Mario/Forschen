'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      const basePath = requireAdmin ? '/admin-login' : '/login';
      const target = pathname && pathname !== '/'
        ? `${basePath}?callbackUrl=${encodeURIComponent(pathname)}`
        : basePath;
      router.replace(target);
      return;
    }
    if (requireAdmin && session.user.role !== 'ADMIN') {
      router.replace('/admin-login');
    }
  }, [session, status, router, requireAdmin, pathname]);

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
