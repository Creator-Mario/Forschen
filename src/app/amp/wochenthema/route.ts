export const dynamic = 'force-dynamic';

import { getCurrentWochenthemaFresh } from '@/lib/db';
import { buildAmpPage, ampResponse, escapeHtml } from '@/lib/amp';

export async function GET() {
  const theme = await getCurrentWochenthemaFresh();

  let body: string;

  if (!theme) {
    body = `
      <h1>Wochenthema</h1>
      <p>Noch kein Wochenthema verfügbar. Bitte schau später noch einmal vorbei.</p>
    `;
  } else {
    const verses = theme.bibleVerses
      .map((v) => `<span class="tag">${escapeHtml(v)}</span>`)
      .join('\n');

    const questions = theme.researchQuestions
      .map((q) => `<li>${escapeHtml(q)}</li>`)
      .join('\n');

    body = `
      <h1>Wochenthema</h1>
      <p class="meta">Woche ${escapeHtml(theme.week)}</p>

      <h2>${escapeHtml(theme.title)}</h2>

      ${theme.bibleVerses.length > 0 ? `<div class="tags">${verses}</div>` : ''}

      <div class="card">
        <p class="label">Einführung</p>
        <p>${escapeHtml(theme.introduction)}</p>
      </div>

      <div class="highlight">
        <p class="label">Die Frage dieser Woche</p>
        <p>${escapeHtml(theme.problemStatement)}</p>
      </div>

      <div class="card">
        <h2>Forschungsfragen</h2>
        <ol>${questions}</ol>
      </div>

      <div class="cta">
        <p>Teile deine Erkenntnisse zu diesem Wochenthema mit der Gemeinschaft.</p>
        <a href="/forschung/beitraege">Beitrag verfassen</a>
      </div>
    `;
  }

  return ampResponse(
    buildAmpPage({
      title: 'Wochenthema',
      canonicalPath: '/wochenthema',
      description: 'Das aktuelle Wochenthema mit Einführung, Bibelstellen und Forschungsfragen.',
      body,
    }),
  );
}
