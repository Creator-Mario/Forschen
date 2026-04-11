import type { Wochenthema } from '@/types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeLines(lines: string[]): string[] {
  return lines.map(line => line.trim()).filter(Boolean);
}

function buildBibleStory(theme: Wochenthema): { title: string; summary: string; explanation: string } {
  const fingerprint = `${theme.title} ${theme.problemStatement} ${theme.introduction}`.toLowerCase();

  if (fingerprint.includes('schöpf')) {
    return {
      title: 'Die Schöpfung in 1. Mose 1–2',
      summary: 'Gott ruft Licht, Leben und Ordnung ins Dasein und setzt den Menschen als sein Ebenbild in die Schöpfung. Diese Geschichte erinnert daran, dass Würde und Verantwortung von Gott her kommen.',
      explanation: 'Für den Glauben heute heißt das: Wir sind nicht zufällig oder wertlos. Unser Leben steht unter Gottes guter Absicht, und wir dürfen die Welt mit Ehrfurcht, Verantwortung und Dankbarkeit gestalten.',
    };
  }

  if (fingerprint.includes('gebet')) {
    return {
      title: 'Jesus lehrt seine Jünger zu beten',
      summary: 'In Matthäus 6 zeigt Jesus, dass Gebet keine Show ist, sondern ein vertrauensvolles Reden mit dem Vater. Er richtet den Blick weg von äußerer Frömmigkeit hin zu echter Beziehung.',
      explanation: 'Das stärkt uns darin, mit allem zu Gott zu kommen: mit Dank, Bitte, Klage und Sehnsucht. Gebet verändert nicht nur Umstände, sondern auch unser Herz vor Gott.',
    };
  }

  if (fingerprint.includes('nachfolg')) {
    return {
      title: 'Die Berufung der ersten Jünger',
      summary: 'Jesus ruft Menschen mitten aus ihrem Alltag heraus: „Folgt mir nach.“ Petrus, Andreas, Jakobus und Johannes lassen sich auf diesen Ruf ein und lernen Schritt für Schritt, Jesus zu vertrauen.',
      explanation: 'Nachfolge beginnt nicht mit Vollkommenheit, sondern mit Bereitschaft. Wer Jesus folgt, entdeckt, dass er Orientierung, Identität und einen neuen Lebensweg schenkt.',
    };
  }

  return {
    title: 'Eine biblische Spur zum Wochenthema',
    summary: `Der Leittext ${theme.bibleVerses[0] ?? 'Johannes 15,5'} zeigt, dass Gott Menschen in ihrer konkreten Lebenswirklichkeit begegnet und sie in seinen Weg hineinruft.`,
    explanation: 'Auch heute lädt Gott dazu ein, Glauben nicht nur zu bedenken, sondern im Alltag zu leben. Biblische Geschichten öffnen dabei einen Raum für Vertrauen, Umkehr, Hoffnung und neue Schritte.',
  };
}

export function buildWeeklyFaithEmailContent(recipientName: string, theme: Wochenthema) {
  const greetingName = recipientName.trim() || 'liebe Schwester, lieber Bruder';
  const verses = normalizeLines(theme.bibleVerses ?? []);
  const questions = normalizeLines(theme.researchQuestions ?? []).slice(0, 4);
  const story = buildBibleStory(theme);
  const questionItems = questions.length > 0
    ? questions
    : [
        'Wo berührt dieses Thema gerade dein persönliches Leben?',
        'Welche biblische Wahrheit möchtest du in dieser Woche bewusst festhalten?',
        'Mit wem könntest du diese Gedanken teilen oder gemeinsam bewegen?',
      ];

  const subject = `Dein christlicher Wochenimpuls: ${theme.title} – Der Fluss des Lebens`;

  const text = [
    `Hallo ${greetingName},`,
    '',
    'hier ist dein persönlicher Wochenimpuls zum christlichen Glauben.',
    '',
    `Thema der Woche: ${theme.title}`,
    '',
    theme.introduction,
    '',
    `Vertiefung: ${theme.problemStatement}`,
    '',
    `Biblische Geschichte: ${story.title}`,
    story.summary,
    '',
    `Erläuterung: ${story.explanation}`,
    '',
    verses.length > 0 ? `Leitstellen: ${verses.join(', ')}` : '',
    '',
    'Fragen und Reflexion:',
    ...questionItems.map((question, index) => `${index + 1}. ${question}`),
    '',
    'Segenswunsch:',
    'Der Herr segne dich in dieser Woche mit Klarheit, Frieden, geistlicher Tiefe und neuer Freude an seinem Wort. Möge Jesus dich leiten, stärken und im Glauben bewahren.',
    '',
    'Herzliche Grüße',
    'Der Fluss des Lebens',
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:32px 24px;color:#1f2937;">
      <h2 style="color:#1e3a8a;margin-bottom:16px;">Dein persönlicher Wochenimpuls</h2>
      <p style="line-height:1.7;">Hallo ${escapeHtml(greetingName)},</p>
      <p style="line-height:1.7;">
        hier ist dein persönlicher Wochenimpuls mit einem ausführlichen Thema zum christlichen Glauben,
        einer biblischen Geschichte, Erklärungen und Fragen zur Reflexion.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1d4ed8;">Thema der Woche</p>
        <h3 style="margin:0 0 12px;color:#1e3a8a;">${escapeHtml(theme.title)}</h3>
        <p style="margin:0;line-height:1.7;">${escapeHtml(theme.introduction)}</p>
      </div>

      <h3 style="color:#1e3a8a;margin:24px 0 8px;">Ausführliche Vertiefung</h3>
      <p style="line-height:1.7;">${escapeHtml(theme.problemStatement)}</p>

      <h3 style="color:#1e3a8a;margin:24px 0 8px;">Biblische Geschichte</h3>
      <p style="font-weight:600;margin-bottom:8px;">${escapeHtml(story.title)}</p>
      <p style="line-height:1.7;">${escapeHtml(story.summary)}</p>

      <h3 style="color:#1e3a8a;margin:24px 0 8px;">Erläuterung für deinen Glaubensalltag</h3>
      <p style="line-height:1.7;">${escapeHtml(story.explanation)}</p>

      ${verses.length > 0 ? `
        <h3 style="color:#1e3a8a;margin:24px 0 8px;">Bibelstellen</h3>
        <p style="line-height:1.7;">${escapeHtml(verses.join(' · '))}</p>
      ` : ''}

      <h3 style="color:#1e3a8a;margin:24px 0 8px;">Fragen und Reflexion</h3>
      <ol style="padding-left:20px;line-height:1.8;">
        ${questionItems.map(question => `<li>${escapeHtml(question)}</li>`).join('')}
      </ol>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-top:24px;">
        <h3 style="margin:0 0 8px;color:#166534;">Segenswunsch</h3>
        <p style="margin:0;line-height:1.7;">
          Der Herr segne dich in dieser Woche mit Klarheit, Frieden, geistlicher Tiefe und neuer Freude an seinem Wort.
          Möge Jesus dich leiten, stärken und im Glauben bewahren.
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}
