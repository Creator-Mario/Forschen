export const dynamic = 'force-dynamic';

import { getTodayGlaubenHeuteThema } from '@/lib/generated-content';
import { formatDate } from '@/lib/utils';
import { buildAmpPage, ampResponse, escapeHtml } from '@/lib/amp';

export async function GET() {
  const item = await getTodayGlaubenHeuteThema();

  const verses = item.bibleVerses
    .map((v) => `<span class="tag">${escapeHtml(v)}</span>`)
    .join('\n');

  const questions = item.questions
    .map((q) => `<li>${escapeHtml(q)}</li>`)
    .join('\n');

  const body = `
    <h1>Glauben heute</h1>
    <p class="meta">${escapeHtml(formatDate(item.date))}</p>

    <h2>${escapeHtml(item.title)}</h2>
    <p class="verse">${escapeHtml(item.headline)}</p>

    ${item.bibleVerses.length > 0 ? `<div class="tags">${verses}</div>` : ''}

    <div class="card">
      <p class="label">Weltgeschehen &amp; Kontext</p>
      <p>${escapeHtml(item.worldFocus)}</p>
    </div>

    <div class="card">
      <p class="label">Glaubensperspektive</p>
      <p>${escapeHtml(item.faithPerspective)}</p>
    </div>

    <div class="highlight">
      <p class="label">Nachfolgeimpuls</p>
      <p>${escapeHtml(item.discipleshipImpulse)}</p>
    </div>

    <div class="card">
      <h2>Fragen zur Vertiefung</h2>
      <ol>${questions}</ol>
    </div>

    <div class="cta">
      <p>Teile deine Beobachtungen oder Fragen zu diesem Thema mit der Gemeinschaft.</p>
      <a href="/forschung/beitraege">Gedankenbeitrag verfassen</a>
    </div>
  `;

  return ampResponse(
    buildAmpPage({
      title: 'Glauben heute',
      canonicalPath: '/glauben-heute',
      description: 'Aktuelle Themenimpulse für den Glauben heute mit Fragen zur Vertiefung und Austausch.',
      body,
    }),
  );
}
