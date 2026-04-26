const fs = require('fs');
const path = require('path');

const BERLIN_TIMEZONE = 'Europe/Berlin';
const DAILY_PUBLISH_HOUR = 3;
const WEEKLY_ARCHIVE_LIMIT = 13;

const themes = [
  {
    title: 'Die Schöpfung – Staunen, Verantwortung und das Bild Gottes',
    introduction: 'Genesis 1-2 lädt uns ein, Schöpfung neu zu entdecken – nicht als wissenschaftliches Lehrbuch, sondern als theologisches Bekenntnis. Der Mensch als Gottes Ebenbild trägt eine besondere Würde und Verantwortung.',
    bibleVerses: ['Genesis 1,1-2,3', 'Psalm 8', 'Römer 8,19-23', 'Kolosser 1,15-20'],
    problemStatement: "Was bedeutet es, als 'Bild Gottes' (imago dei) erschaffen zu sein? Diese Frage berührt Menschenwürde, Ökologie und unser Verständnis von Schöpfungsverantwortung im 21. Jahrhundert.",
    researchQuestions: [
      "Was bedeutet 'imago dei' im altorientalischen Kontext?",
      'Wie unterscheidet sich der biblische Schöpfungsbericht von anderen Schöpfungsmythen der Zeit?',
      'Welche ethische Verantwortung ergibt sich aus der Gottebenbildlichkeit?',
      'Wie verhält sich die Schöpfungstheologie zur modernen Ökologie?',
      "Was bedeutet die 'gute Schöpfung' angesichts von Leid und Tod?",
    ],
  },
  {
    title: 'Das Gebet – Reden mit Gott, Hören auf Gott',
    introduction: 'Gebet ist die älteste und persönlichste Form des Gottesverhältnisses. Von den Psalmen bis zum Vaterunser – die Bibel zeigt uns eine reiche Gebetskultur, die weit mehr umfasst als fromme Formeln.',
    bibleVerses: ['Matthäus 6,5-15', 'Psalm 22', 'Römer 8,26-27', '1. Thessalonicher 5,16-18'],
    problemStatement: 'Wird Gebet erhört? Diese schlichte Frage birgt tiefe theologische Abgründe. Wie verhält sich das Beten zu Gottes Souveränität? Was bedeutet es, wenn Gebete scheinbar unerhört bleiben?',
    researchQuestions: [
      'Welche verschiedenen Gebetsformen finden sich in der Bibel (Bitte, Klage, Lobpreis, Dank)?',
      'Was unterscheidet das Vaterunser von Gebeten des antiken Judentums?',
      'Wie betet der Geist für uns (Römer 8,26)?',
      'Welche Rolle spielt Stille im biblischen Gebetsverständnis?',
      'Wie kann Klage (wie in den Klageliedern) eine Form des Gebets sein?',
    ],
  },
  {
    title: 'Die Nachfolge – Was bedeutet es, Jesus nachzufolgen?',
    introduction: 'Nachfolge Jesu ist mehr als Kirchenmitgliedschaft. Die synoptischen Evangelien zeigen radikale Jünger, die alles zurückließen. Was bedeutet das heute, in einer säkularen Gesellschaft?',
    bibleVerses: ['Markus 1,16-20', 'Lukas 9,23-25', 'Johannes 15,1-17', 'Galater 2,20'],
    problemStatement: 'Jesus ruft zur Nachfolge unter dem Zeichen des Kreuzes. Diese Einladung ist gleichzeitig befreiend und herausfordernd. Wie lässt sich radikale Nachfolge mit dem Leben in der Welt vereinbaren?',
    researchQuestions: [
      "Was bedeutete 'Nachfolge' (gr. akolouthein) im Kontext des rabbinischen Judentums?",
      "Welche Konsequenzen hat das 'Selbst verleugnen' (Lukas 9,23) für das moderne Lebensverständnis?",
      "Wie versteht Paulus Nachfolge als 'mit Christus gekreuzigt sein'?",
      'Was lernen wir von historischen Nachfolgebewegungen (Franziskaner, Täufer, Bonhoeffer)?',
      'Wie verhält sich individuelle Nachfolge zu gemeinschaftlicher Nachfolge?',
    ],
  },
];

function getDefaultDataPath() {
  return path.resolve(process.cwd(), 'data', 'wochenthema.json');
}

function getBerlinPublicationDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );
  const berlinDate = `${parts.year}-${parts.month}-${parts.day}`;
  if (Number(parts.hour) >= DAILY_PUBLISH_HOUR) return berlinDate;
  const previousDate = new Date(`${berlinDate}T00:00:00Z`);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  return previousDate.toISOString().split('T')[0];
}

function getISOWeek(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getPublicationWeek(date = new Date()) {
  const publicationDate = new Date(`${getBerlinPublicationDate(date)}T00:00:00Z`);
  if (publicationDate.getUTCDay() === 0) {
    publicationDate.setUTCDate(publicationDate.getUTCDate() + 1);
  }
  return getISOWeek(publicationDate);
}

function readEntries(dataPath = getDefaultDataPath()) {
  const parsed = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${dataPath} to contain a JSON array.`);
  }
  return parsed;
}

function writeEntries(dataPath, entries) {
  fs.writeFileSync(dataPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

function isPublishedOrArchived(entry) {
  return entry.status === 'published' || entry.status === 'archived';
}

function getLatestPublishedOrArchivedWeek({ dataPath = getDefaultDataPath() } = {}) {
  const publicationWeek = readEntries(dataPath)
    .filter(isPublishedOrArchived)
    .sort((a, b) => a.week.localeCompare(b.week))
    .at(-1)?.week;

  if (!publicationWeek) {
    throw new Error('No published or archived Wochenthema entry found after generation.');
  }

  return publicationWeek;
}

function generateWeeklyTheme({ dataPath = getDefaultDataPath(), now = new Date() } = {}) {
  const existing = readEntries(dataPath);
  const currentWeek = getPublicationWeek(now);

  if (existing.some(entry => entry.week === currentWeek)) {
    return {
      status: 'skipped',
      currentWeek,
      entries: existing,
    };
  }

  const weekNum = Number.parseInt(currentWeek.split('-W')[1], 10);
  if (Number.isNaN(weekNum)) {
    throw new Error(`Could not determine ISO week number from "${currentWeek}".`);
  }

  const selectedTheme = themes[weekNum % themes.length];
  const newTheme = {
    id: currentWeek,
    week: currentWeek,
    ...selectedTheme,
    status: 'published',
    createdAt: new Date(now).toISOString(),
  };

  const updatedEntries = [...existing, newTheme];
  const publishedOrArchived = updatedEntries
    .filter(isPublishedOrArchived)
    .sort((a, b) => a.week.localeCompare(b.week));
  const retainedThemes = publishedOrArchived.slice(-WEEKLY_ARCHIVE_LIMIT);
  const drafts = updatedEntries.filter(entry => !isPublishedOrArchived(entry));
  const prunedCount = publishedOrArchived.length - retainedThemes.length;
  const nextEntries = [...retainedThemes, ...drafts];

  writeEntries(dataPath, nextEntries);

  return {
    status: 'generated',
    currentWeek,
    newTheme,
    prunedCount,
    entries: nextEntries,
  };
}

module.exports = {
  generateWeeklyTheme,
  getLatestPublishedOrArchivedWeek,
  getPublicationWeek,
};
