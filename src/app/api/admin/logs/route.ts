import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminLogs, getUsers } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs = getAdminLogs();
  const users = getUsers();

  // Enrich logs with admin name
  const enriched = logs.map(log => {
    const admin = users.find(u => u.id === log.adminId);
    return { ...log, adminName: admin?.name || log.adminId, adminEmail: admin?.email || '' };
  });

  return NextResponse.json(enriched.reverse()); // newest first
}
