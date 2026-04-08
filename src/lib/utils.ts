export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getISOWeek(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/<[^>]*>/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '…';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ausstehend',
    created: 'Eingereicht',
    review: 'In Prüfung',
    approved: 'Genehmigt',
    published: 'Veröffentlicht',
    question_to_user: 'Rückfrage',
    postponed: 'Zurückgestellt',
    deleted: 'Gelöscht',
    rejected: 'Abgelehnt',
    draft: 'Entwurf',
    archived: 'Archiviert',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    created: 'bg-yellow-100 text-yellow-800',
    review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-green-100 text-green-800',
    question_to_user: 'bg-orange-100 text-orange-800',
    postponed: 'bg-slate-100 text-slate-800',
    deleted: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    archived: 'bg-slate-100 text-slate-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
