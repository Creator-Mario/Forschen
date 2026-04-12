'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModerationTable from '@/components/AdminModerationTable';
import { useEffect, useState } from 'react';
import type { Video, User, Wochenthema } from '@/types';
import { isModerationQueueStatus } from '@/lib/utils';

const REQUEST_TIMEOUT_MS = 12000;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Fehler beim Laden (${response.status})`;
      try {
        const data = await response.json();
        if (typeof data?.error === 'string' && data.error.trim()) {
          message = data.error;
        }
      } catch {
        // ignore malformed error payloads
      }
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Zeitüberschreitung beim Laden. Bitte erneut versuchen.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export default function AdminVideosPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [themes, setThemes] = useState<Wochenthema[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoadError(null);
    try {
      const [videoResult, userResult, themeResult] = await Promise.allSettled([
        fetchJson<Video[]>('/api/videos?all=1'),
        fetchJson<User[]>('/api/admin/users'),
        fetchJson<Wochenthema[]>('/api/wochenthema?all=1'),
      ]);

      if (videoResult.status === 'fulfilled' && Array.isArray(videoResult.value)) {
        setItems(videoResult.value);
      } else {
        setItems([]);
        setLoadError('Fehler beim Laden der Videos. Bitte Seite neu laden.');
      }

      if (userResult.status === 'fulfilled' && Array.isArray(userResult.value)) {
        setUsers(userResult.value);
      } else {
        setUsers([]);
      }

      if (themeResult.status === 'fulfilled' && Array.isArray(themeResult.value)) {
        setThemes(themeResult.value.filter(theme => theme.status === 'published'));
      } else {
        setThemes([]);
      }
    } catch (err) {
      console.error('[admin/videos] load failed:', err);
      setLoadError('Fehler beim Laden der Daten. Bitte Seite neu laden.');
    }
  }

  useEffect(() => { load(); }, []);

  const moderationItems = items.filter(item => isModerationQueueStatus(item.status));

  async function onAction(id: string, status: string, message?: string, wochenthemaId?: string) {
    await fetchJson<{ success: boolean }>('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'video', id, status, adminMessage: message, wochenthemaId }),
    });
    await load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Videos moderieren</h1>
        <p className="text-gray-500 mb-8">
          {moderationItems.length} ausstehend
        </p>
        {loadError && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            ❌ {loadError}
          </div>
        )}
        <AdminModerationTable
          items={moderationItems}
          contentType="Video"
          users={users}
          titleField="title"
          authorField="authorName"
          contentField="description"
          onAction={onAction}
          themeOptions={themes}
        />
      </div>
    </ProtectedRoute>
  );
}
