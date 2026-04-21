export const dynamic = 'force-dynamic';

import { getTodayPsalmThema } from '@/lib/generated-content';
import { formatDate } from '@/lib/utils';
import { buildAmpPage, ampResponse, escapeHtml } from '@/lib/amp';

export async function GET() {
  const item = await getTodayPsalmThema();

  const questions = item.questions
    .map((q) => `<li>${escapeHtml(q)}</li>`)
    .join('\n');

  const body = `
    <h1>Psalm des Tages</h1>
    <p class="meta">${escapeHtml(formatDate(item.date))}</p>

    <div class="card">
      <p class="label">Psalmvers</p>
      <p class="verse">${escapeHtml(item.excerpt)}</p>
      <p class="ref">${escapeHtml(item.psalmReference)}</p>
    </div>

    <h2>${escapeHtml(item.title)}</h2>

    <div class="card">
      <p class="label">Zusammenfassung</p>
      <p>${escapeHtml(item.summary)}</p>
    </div>

    <div class="card">
      <p class="label">Bedeutung für die Nachfolge</p>
      <p>${escapeHtml(item.significance)}</p>
    </div>

    <div class="highlight">
      <p class="label">Impuls für heute</p>
      <p>${escapeHtml(item.practice)}</p>
    </div>

    <div class="card">
      <h2>Forschungsfragen für heute</h2>
      <ol>${questions}</ol>
    </div>

    <div class="cta">
      <p>Schreibe einen Beitrag oder eine geistliche Beobachtung zu diesem Psalm.</p>
      <a href="/forschung/beitraege">Psalm-Beitrag verfassen</a>
    </div>
  `;

  return ampResponse(
    buildAmpPage({
      title: 'Psalm des Tages',
      canonicalPath: '/psalmen',
      description: 'Der Psalm des Tages mit Impuls, Fragen zur Vertiefung und geistlicher Einordnung.',
      body,
    }),
  );
}
