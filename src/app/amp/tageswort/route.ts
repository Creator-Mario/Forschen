export const dynamic = 'force-dynamic';

import { getTodayTageswortFresh } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { buildAmpPage, ampResponse, escapeHtml } from '@/lib/amp';

export async function GET() {
  const tageswort = await getTodayTageswortFresh();

  let body: string;

  if (!tageswort) {
    body = `
      <h1>Tageswort</h1>
      <p class="meta">Noch kein Tageswort für heute verfügbar.</p>
    `;
  } else {
    const questions = tageswort.questions
      .map((q) => `<li>${escapeHtml(q)}</li>`)
      .join('\n');

    body = `
      <h1>Tageswort</h1>
      <p class="meta">${escapeHtml(formatDate(tageswort.date))}</p>

      <div class="card">
        <p class="label">Bibelvers</p>
        <p class="verse">${escapeHtml(tageswort.text)}</p>
        <p class="ref">${escapeHtml(tageswort.verse)}</p>
      </div>

      <div class="card">
        <p class="label">Auslegung &amp; Kontext</p>
        <p>${escapeHtml(tageswort.context)}</p>
      </div>

      <div class="card">
        <h2>Forschungsfragen für heute</h2>
        <ol>${questions}</ol>
      </div>

      <div class="cta">
        <p>Teile deine Gedanken zu diesem Vers mit der Gemeinschaft.</p>
        <a href="/forschung/beitraege">Beitrag verfassen</a>
      </div>
    `;
  }

  return ampResponse(
    buildAmpPage({
      title: 'Tageswort',
      canonicalPath: '/tageswort',
      description: 'Das aktuelle Tageswort mit Bibelvers, Auslegung und Forschungsfragen für den Tag.',
      body,
    }),
  );
}
