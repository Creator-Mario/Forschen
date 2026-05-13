import type {
  PsalmThema,
  GlaubenHeuteThema,
  Buchempfehlung,
  BuchempfehlungsSammlung,
  GeneratedTopicBundle,
  GeneratedTopicSource,
} from '@/types';
import { GENERATED_ARCHIVE_DAYS } from './archive-window';
import {
  getGeneratedTopicBundleByDateFresh,
  getGeneratedTopicBundlesFresh,
  saveGeneratedTopicBundle,
} from './db';
import { getCurrentPublicationDate } from './publishing';

const psalmSeeds = [
  {
    psalmReference: 'Psalm 1,1-3',
    title: 'Verwurzelt leben',
    excerpt: 'Der Gerechte ist wie ein Baum, gepflanzt an Wasserbächen.',
    summary: 'Psalm 1 eröffnet den Psalter mit der Grundfrage, welcher Weg ein Leben wirklich trägt. Der Psalm kontrastiert flüchtige Einflüsse mit einer tiefen Verwurzelung im Wort Gottes.',
    significance: 'Für die Nachfolge bedeutet das: geistliche Reife wächst nicht aus Hektik, sondern aus beständiger Ausrichtung auf Gottes Weisung.',
    practice: 'Nimm dir heute Zeit, deine wichtigsten Einflüsse zu prüfen: Was nährt dich wirklich und was zieht dich innerlich leer?',
    questions: [
      'Welche Wege beschreibt Psalm 1 als lebensfördernd und welche als zerstörerisch?',
      'Was bedeutet es heute konkret, über Gottes Weisung Tag und Nacht nachzusinnen?',
      'Wie zeigt sich geistliche Fruchtbarkeit im Alltag?',
    ],
  },
  {
    psalmReference: 'Psalm 23,1-4',
    title: 'Geborgenheit unter Gottes Führung',
    excerpt: 'Der Herr ist mein Hirte, mir wird nichts mangeln.',
    summary: 'Der Psalm beschreibt Gott nicht abstrakt, sondern als Hirten, der führt, versorgt und durch dunkle Täler hindurch begleitet.',
    significance: 'Gerade in unsicheren Zeiten erinnert Psalm 23 daran, dass Nachfolge nicht Kontrolle, sondern Vertrauen lernt.',
    practice: 'Frage dich heute: Wo versuchst du aus Angst zu kontrollieren, statt dich von Gott leiten zu lassen?',
    questions: [
      'Welche Seiten von Gottes Charakter werden im Hirtenbild sichtbar?',
      'Wie spricht Psalm 23 in persönliche oder gesellschaftliche Krisenzeiten hinein?',
      'Was verändert sich, wenn Mangel nicht das letzte Wort hat?',
    ],
  },
  {
    psalmReference: 'Psalm 27,1-4',
    title: 'Mut trotz Gegenwind',
    excerpt: 'Der Herr ist mein Licht und mein Heil; vor wem sollte ich mich fürchten?',
    summary: 'Psalm 27 verbindet starke Zuversicht mit ehrlicher Bedrohungserfahrung. Der Beter verdrängt Angst nicht, sondern bringt sie vor Gott.',
    significance: 'Die geistliche Stärke dieses Psalms liegt darin, dass Hoffnung nicht aus günstigen Umständen, sondern aus Gottes Gegenwart erwächst.',
    practice: 'Benenne heute eine konkrete Angst und formuliere daneben bewusst, was Gottes Nähe darüber aussagt.',
    questions: [
      'Wie hängen Gottes Gegenwart und menschlicher Mut in Psalm 27 zusammen?',
      'Warum ist Anbetung hier kein Rückzug, sondern eine Form geistlicher Standfestigkeit?',
      'Wie kann dieser Psalm in Konflikten oder Unsicherheit gebetet werden?',
    ],
  },
  {
    psalmReference: 'Psalm 42,2-6',
    title: 'Sehnsucht nach Gottes Nähe',
    excerpt: 'Wie der Hirsch lechzt nach frischem Wasser, so schreit meine Seele, Gott, zu dir.',
    summary: 'Psalm 42 zeigt, dass geistliche Sehnsucht und innere Unruhe zusammengehören können. Der Glaube wird hier nicht geschniegelt, sondern ehrlich ausgesprochen.',
    significance: 'Für die Nachfolge ist dieser Psalm wichtig, weil er lehrt, geistliche Trockenheit nicht zu verstecken, sondern in ein Gespräch mit Gott zu verwandeln.',
    practice: 'Nimm dir heute einen stillen Moment und formuliere ohne fromme Fassade, wonach sich deine Seele gerade wirklich sehnt.',
    questions: [
      'Welche Formen geistlicher Trockenheit beschreibt der Psalm?',
      'Wie spricht der Beter mit seiner eigenen Seele?',
      'Was bedeutet Hoffnung, wenn die Antwort Gottes nicht sofort spürbar ist?',
    ],
  },
  {
    psalmReference: 'Psalm 46,2-8',
    title: 'Ruhe mitten im Chaos',
    excerpt: 'Gott ist unsere Zuflucht und Stärke, eine Hilfe in den großen Nöten.',
    summary: 'Psalm 46 entfaltet Gottes Nähe gerade dort, wo persönliche und politische Erschütterungen die Ordnung bedrohen.',
    significance: 'Der Psalm hilft, aktuelle Krisen nicht kleinzureden und doch mit geistlicher Nüchternheit auf Gottes Beständigkeit zu schauen.',
    practice: 'Lies heute bewusst Nachrichten oder eigene Sorgen im Licht von Psalm 46 und bete danach mit dem Satz: Gott ist meine Zuflucht.',
    questions: [
      'Wie verbindet Psalm 46 Weltkrisen mit persönlichem Vertrauen?',
      'Was unterscheidet Gottes Frieden von bloßer Konfliktvermeidung?',
      'Welche Haltung der Gemeinde wächst aus diesem Psalm?',
    ],
  },
  {
    psalmReference: 'Psalm 51,3-12',
    title: 'Umkehr mit offenem Herzen',
    excerpt: 'Schaffe in mir, Gott, ein reines Herz.',
    summary: 'Psalm 51 ist ein Bußpsalm, der nicht bei Schuld stehen bleibt, sondern Gottes erneuernde Gnade sucht.',
    significance: 'Er zeigt, dass echte Umkehr nicht Selbstrettung ist, sondern die Bitte um ein innerlich verwandeltes Herz.',
    practice: 'Halte heute kurz inne und nenne vor Gott konkret, was bereinigt und neu geordnet werden soll.',
    questions: [
      'Welche Form von Reue beschreibt Psalm 51?',
      'Warum ist das neue Herz entscheidender als bloße äußere Korrektur?',
      'Wie wird aus persönlicher Umkehr neue Hoffnung?',
    ],
  },
  {
    psalmReference: 'Psalm 139,1-10',
    title: 'Von Gott ganz erkannt',
    excerpt: 'Herr, du erforschest mich und kennest mich.',
    summary: 'Psalm 139 verbindet Gottes Allwissenheit mit seiner liebevollen Nähe. Erkenntnis wird hier nicht bedrohlich, sondern tröstlich.',
    significance: 'Gerade in einer Zeit der Selbstdarstellung erinnert der Psalm daran, dass unsere tiefste Identität aus Gottes Blick hervorgeht.',
    practice: 'Frage dich heute: Wo suche ich Anerkennung, die ich längst aus Gottes Zuwendung empfangen habe?',
    questions: [
      'Wie verändert Gottes umfassende Kenntnis unser Selbstverständnis?',
      'Warum ist Gottes Nähe in Psalm 139 keine Überwachung, sondern Trost?',
      'Welche Konsequenzen hat dieser Psalm für Ehrlichkeit und Identität?',
    ],
  },
] as const;

const currentTopicSeeds = [
  {
    title: 'Digitale Überforderung und geistliche Sammlung',
    headline: 'Zwischen Dauerrauschen und Gottes leiser Stimme',
    worldFocus: 'Viele Menschen erleben einen Alltag aus Benachrichtigungen, Informationsflut und permanenter Erreichbarkeit. Aufmerksamkeit wird zur umkämpften Ressource.',
    faithPerspective: 'Christliche Nachfolge erinnert daran, dass der Mensch nicht für ununterbrochenes Reagieren geschaffen ist. Gottes Stimme ruft in die Sammlung, Stille und Unterscheidung.',
    discipleshipImpulse: 'Plane heute eine konkrete Unterbrechung digitaler Reize ein und nutze sie für Gebet, Bibellesen oder stilles Hören.',
    bibleVerses: ['Psalm 46,11', 'Markus 1,35', 'Lukas 10,41-42'],
    questions: [
      'Wie verändert digitale Dauerreizung mein Hören auf Gott und auf andere Menschen?',
      'Welche Grenzen helfen mir, geistlich wach zu bleiben?',
      'Was heißt es heute, den besseren Teil zu wählen?',
    ],
    books: [
      {
        title: 'Nachfolge',
        author: 'Dietrich Bonhoeffer',
        description: 'Bonhoeffer ruft zu einem Glauben, der aus dem Hören auf Christus entsteht und nicht im religiösen Nebel stecken bleibt.',
        relevance: 'Hilft, geistliche Prioritäten neu zu ordnen, wenn zu viele Stimmen gleichzeitig Anspruch erheben.',
      },
      {
        title: 'Gottes Weisheit entdecken',
        author: 'Eugene H. Peterson',
        description: 'Ein seelsorglicher Zugang dazu, wie Gottes Wort den Menschen innerlich formt und in eine ruhige Treue führt.',
        relevance: 'Passt besonders gut zu Tagen, an denen Sammlung und innere Entschleunigung nötig sind.',
      },
    ],
  },
  {
    title: 'Wahrheit in polarisierten Zeiten',
    headline: 'Wenn Meinungen lauter werden als Weisheit',
    worldFocus: 'Gesellschaftliche Debatten sind oft von Zuspitzung, Empörung und Misstrauen geprägt. Viele fragen sich, wie Wahrheit überhaupt noch erkannt werden kann.',
    faithPerspective: 'Der christliche Glaube verbindet Wahrheit mit der Person Jesu und ruft zu Wahrhaftigkeit, Geduld und Demut statt zur bloßen Rechthaberei.',
    discipleshipImpulse: 'Prüfe heute bewusst, ob deine Worte Frieden stiften, Klarheit schaffen und gleichzeitig in Liebe gesprochen werden.',
    bibleVerses: ['Johannes 14,6', 'Epheser 4,15', 'Jakobus 1,19'],
    questions: [
      'Wie unterscheidet sich christliche Wahrhaftigkeit von bloßer Schlagfertigkeit?',
      'Welche Rolle spielt Demut bei der Suche nach Wahrheit?',
      'Wie können Christen in hitzigen Debatten glaubwürdig bleiben?',
    ],
    books: [
      {
        title: 'Pardon, ich bin Christ',
        author: 'C. S. Lewis',
        description: 'Lewis erklärt den Kern des christlichen Glaubens klar, argumentativ und zugleich zugänglich.',
        relevance: 'Hilfreich, um den Glauben in einer verwirrenden Debattenkultur verständlich und nüchtern zu durchdenken.',
      },
      {
        title: 'Basic Christianity',
        author: 'John Stott',
        description: 'Ein konzentrierter Überblick über das Evangelium und die daraus folgende Lebenspraxis.',
        relevance: 'Stärkt die Fähigkeit, zentrale Wahrheiten sauber zu benennen, ohne unnötig zu polarisieren.',
      },
    ],
  },
  {
    title: 'Hoffnung in einer Krisenwelt',
    headline: 'Warum christliche Hoffnung mehr ist als Optimismus',
    worldFocus: 'Kriege, Krisenmeldungen und wirtschaftliche Unsicherheit erzeugen bei vielen Menschen Müdigkeit, Zukunftsangst und inneren Rückzug.',
    faithPerspective: 'Biblische Hoffnung ist kein positives Denken, sondern eine begründete Erwartung, dass Gott Geschichte und Leben nicht aus der Hand gegeben hat.',
    discipleshipImpulse: 'Setze heute bewusst ein Zeichen der Hoffnung: ein Gebet, ein Gespräch oder eine Ermutigung für jemanden, der unter Druck steht.',
    bibleVerses: ['Römer 15,13', '1. Petrus 1,3', 'Klagelieder 3,21-23'],
    questions: [
      'Wie unterscheidet sich Hoffnung von bloßer Stimmung?',
      'Wodurch wird christliche Hoffnung in leidvollen Zeiten genährt?',
      'Wie kann Hoffnung sichtbar gelebt werden, ohne Leid zu verharmlosen?',
    ],
    books: [
      {
        title: 'Das Gebet des Jabez',
        author: 'Bruce Wilkinson',
        description: 'Ein leicht zugänglicher Impuls, Gottes Handeln erwartungsvoll in den Alltag hineinzubitten.',
        relevance: 'Kann helfen, Hoffnung wieder praktisch und betend zu buchstabieren.',
      },
      {
        title: 'Der Weg des Herzens',
        author: 'Henri J. M. Nouwen',
        description: 'Nouwen beschreibt, wie Christen in Einsamkeit, Gebet und Dienst eine tragfähige innere Hoffnung finden.',
        relevance: 'Besonders hilfreich, wenn Krisenmeldungen innerlich erschöpfen.',
      },
    ],
  },
  {
    title: 'Leistungsdruck und Identität',
    headline: 'Wenn der eigene Wert an Produktivität gemessen wird',
    worldFocus: 'Viele Menschen definieren sich über Leistung, Sichtbarkeit und ständige Verbesserung. Ruhe wirkt schnell wie Rückstand.',
    faithPerspective: 'Das Evangelium widerspricht dieser Logik: Würde ist Geschenk, nicht Ergebnis. Nachfolge beginnt aus Annahme, nicht aus Selbstoptimierung.',
    discipleshipImpulse: 'Ersetze heute eine innere Selbstanklage bewusst durch einen biblischen Zuspruch über deine Identität in Christus.',
    bibleVerses: ['Matthäus 11,28-30', 'Galater 2,20', 'Epheser 2,8-10'],
    questions: [
      'Wie prägt Leistungskultur mein Gottesbild und Selbstbild?',
      'Was bedeutet es, aus Gnade und nicht aus Beweisführung zu leben?',
      'Wie können Arbeit und Ruhe geistlich gesund zusammenfinden?',
    ],
    books: [
      {
        title: 'The Spirit of the Disciplines',
        author: 'Dallas Willard',
        description: 'Willard zeigt, dass geistliches Wachstum nicht aus Aktivismus entsteht, sondern aus einer geordneten Hingabe an Christus.',
        relevance: 'Hilft, Leistung und geistliche Formung sauber voneinander zu unterscheiden.',
      },
      {
        title: 'Leben ist mehr',
        author: 'Tim Keller',
        description: 'Keller legt dar, wie das Evangelium falsche Identitätsquellen entlarvt und zu echter Freiheit führt.',
        relevance: 'Besonders wertvoll, wenn Anerkennung und Erfolg das Denken stark bestimmen.',
      },
    ],
  },
  {
    title: 'Einsamkeit und echte Gemeinschaft',
    headline: 'Verbunden wirken und sich doch allein fühlen',
    worldFocus: 'Trotz digitaler Vernetzung wächst bei vielen die Erfahrung von Isolation, Übersehenwerden und tiefer emotionaler Distanz.',
    faithPerspective: 'Die Kirche ist nicht nur Veranstaltungsort, sondern ein Leib, in dem Menschen gesehen, getragen und geistlich begleitet werden sollen.',
    discipleshipImpulse: 'Suche heute aktiv ein ehrliches Gespräch statt nur oberflächlichen Kontakt. Gemeinschaft wächst durch Verlässlichkeit.',
    bibleVerses: ['Hebräer 10,24-25', 'Apostelgeschichte 2,42-47', 'Prediger 4,9-10'],
    questions: [
      'Warum ist Einsamkeit trotz Vernetzung so verbreitet?',
      'Was zeichnet biblische Gemeinschaft gegenüber bloßer Geselligkeit aus?',
      'Welche Schritte stärken Nähe, Vertrauen und gegenseitige Fürsorge?',
    ],
    books: [
      {
        title: 'Gemeinsames Leben',
        author: 'Dietrich Bonhoeffer',
        description: 'Ein geistlich tiefes, zugleich sehr praktisches Buch über christliche Gemeinschaft im Alltag.',
        relevance: 'Ein Klassiker, um Gemeinschaft nicht romantisch, sondern geistlich realistisch zu verstehen.',
      },
      {
        title: 'The Wounded Healer',
        author: 'Henri J. M. Nouwen',
        description: 'Nouwen beschreibt, wie verletzliche Menschen füreinander zu Orten heilender Gegenwart werden können.',
        relevance: 'Hilft, Gemeinschaft nicht als Perfektionsraum, sondern als Ort geteilter Menschlichkeit zu sehen.',
      },
    ],
  },
  {
    title: 'Frieden in konfliktgeladenen Zeiten',
    headline: 'Versöhnung lernen, wenn Fronten sich verhärten',
    worldFocus: 'Konflikte in Politik, Familie und Gemeinde eskalieren oft schnell. Der Ton wird rauer, die Bereitschaft zum Zuhören kleiner.',
    faithPerspective: 'Jesus nennt die Friedensstifter selig. Christlicher Friede ist nicht Konfliktvermeidung, sondern die mutige Suche nach Wahrheit, Gerechtigkeit und Versöhnung.',
    discipleshipImpulse: 'Gehe heute einen kleinen Schritt auf eine angespannte Beziehung zu: durch Gebet, Zuhören oder ein klärendes Wort.',
    bibleVerses: ['Matthäus 5,9', 'Römer 12,18', 'Kolosser 3,12-15'],
    questions: [
      'Was unterscheidet Friedenstiften von Harmoniestreben?',
      'Wie hängen Wahrheit, Gerechtigkeit und Versöhnung zusammen?',
      'Welche geistlichen Haltungen helfen in festgefahrenen Konflikten?',
    ],
    books: [
      {
        title: 'The Peacemaker',
        author: 'Ken Sande',
        description: 'Ein sehr praktischer Leitfaden, wie Christen Konflikte biblisch bearbeiten und Versöhnung suchen können.',
        relevance: 'Besonders geeignet, wenn Konflikte nicht nur verstanden, sondern konkret bearbeitet werden sollen.',
      },
      {
        title: 'Mere Christianity',
        author: 'C. S. Lewis',
        description: 'Lewis verbindet klare Überzeugungen mit einem Ton, der zur Demut und zum gemeinsamen Ringen um Wahrheit einlädt.',
        relevance: 'Hilft, Überzeugung und Friedfertigkeit nicht gegeneinander auszuspielen.',
      },
    ],
  },
  {
    title: 'Künstliche Intelligenz und Menschenwürde',
    headline: 'Technischer Fortschritt und die Frage nach dem Bild Gottes',
    worldFocus: 'KI verändert Kommunikation, Arbeit und Bildung. Gleichzeitig wachsen Fragen nach Wahrheit, Verantwortung und dem Wesen menschlicher Würde.',
    faithPerspective: 'Christlicher Glaube betrachtet den Menschen nicht primär nach seiner Nützlichkeit, sondern als Ebenbild Gottes mit unverlierbarer Würde.',
    discipleshipImpulse: 'Nutze Technik heute bewusst dienend: als Werkzeug, nicht als Identitätsquelle oder Ersatz für Weisheit.',
    bibleVerses: ['1. Mose 1,26-27', 'Psalm 8,4-7', 'Philipper 4,8'],
    questions: [
      'Welche Chancen und Grenzen sind mit KI aus christlicher Sicht zu bedenken?',
      'Wie schützt der Glaube die Würde des Menschen im digitalen Wandel?',
      'Was heißt geistliche Unterscheidung im Umgang mit neuer Technologie?',
    ],
    books: [
      {
        title: 'Futureville',
        author: 'Skye Jethani',
        description: 'Ein zugänglicher Einstieg in die Frage, wie Christen technologische Entwicklungen geistlich reflektieren können.',
        relevance: 'Hilft, Fortschritt nicht reflexhaft abzulehnen oder unkritisch zu feiern.',
      },
      {
        title: 'The Divine Conspiracy',
        author: 'Dallas Willard',
        description: 'Willard zeichnet die Tiefe des Lebens im Reich Gottes nach und bewahrt damit den Blick für das eigentlich Menschliche.',
        relevance: 'Wichtig, um Technik im größeren Horizont von Nachfolge, Charakter und Gottes Reich zu beurteilen.',
      },
    ],
  },
] as const;

const GENERATED_TOPIC_PROMPT_VERSION = 'v3';
const OPENAI_API_BASE_URL = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini';
const AI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS ?? 20000);
const AI_MAX_RETRIES = 2;
const CHRISTIAN_NEWS_TIMEOUT_MS = Number(process.env.CHRISTIAN_NEWS_TIMEOUT_MS ?? 2500);
const CHRISTIAN_NEWS_SOURCE_LIMIT = 3;
const CHRISTIAN_NEWS_HEADLINE_LIMIT = 4;
const CHRISTIAN_NEWS_USER_AGENT = 'Forschen/1.0';
const CURRENT_TOPIC_HEADLINE_PREFIX = 'Heute im Blick:';
const inFlightTopicGenerations = new Map<string, Promise<GeneratedTopicBundle>>();
const inFlightChristianNews = new Map<string, Promise<ChristianNewsContext | null>>();

const CHRISTIAN_NEWS_FEEDS = [
  { source: 'Vatican News', url: 'https://www.vaticannews.va/de.rss.xml' },
  { source: 'evangelisch.de', url: 'https://www.evangelisch.de/rss/news.xml' },
  { source: 'IDEA', url: 'https://www.idea.de/rss/news' },
  { source: 'katholisch.de', url: 'https://www.katholisch.de/aktuelles/rss' },
] as const;

interface ChristianNewsHeadline {
  source: string;
  title: string;
  publishedAt?: string;
}

interface ChristianNewsContext {
  date: string;
  headlines: ChristianNewsHeadline[];
}

interface GeneratedTopicPromptContext {
  currentEvents: ChristianNewsContext | null;
  recentTopicTitles: string[];
  recentPsalmReferences: string[];
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDeterministicHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getSeedIndex(date: string, length: number, salt: string): number {
  return getDeterministicHash(`${date}:${salt}`) % length;
}

function buildDateList(endDate: string): string[] {
  const dates: string[] = [];
  const cursor = parseIsoDate(endDate);
  for (let index = 0; index < GENERATED_ARCHIVE_DAYS; index += 1) {
    dates.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return dates;
}

function buildPsalmThema(date: string): PsalmThema {
  const seed = psalmSeeds[getSeedIndex(date, psalmSeeds.length, 'psalm')];
  return {
    id: `psalm-${date}`,
    date,
    psalmReference: seed.psalmReference,
    title: seed.title,
    excerpt: seed.excerpt,
    summary: seed.summary,
    significance: seed.significance,
    practice: seed.practice,
    questions: [...seed.questions],
  };
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(amp|quot|#39|apos|lt|gt);/g, (_match, entity: string) => {
      switch (entity) {
        case 'amp':
          return '&';
        case 'quot':
          return '"';
        case '#39':
        case 'apos':
          return '\'';
        case 'lt':
          return '<';
        case 'gt':
          return '>';
        default:
          return _match;
      }
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(value: string): string {
  return decodeXmlEntities(value.replace(/<[^>]+>/g, ' '));
}

function extractXmlValue(block: string, tagName: string): string | null {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match?.[1] ? stripHtml(match[1]) : null;
}

function parseFeedDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function parseChristianNewsFeed(xml: string, source: string): ChristianNewsHeadline[] {
  const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(match => match[0]);
  const entries = items.length ? items : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map(match => match[0]);

  const parsedEntriesWithNulls: Array<ChristianNewsHeadline | null> = entries.map(block => {
      const title = extractXmlValue(block, 'title');
      if (!title) return null;
      return {
        source,
        title,
        publishedAt: parseFeedDate(
          extractXmlValue(block, 'pubDate')
          ?? extractXmlValue(block, 'published')
          ?? extractXmlValue(block, 'updated')
          ?? undefined
        ),
      };
    });

  return parsedEntriesWithNulls.filter((entry): entry is ChristianNewsHeadline => entry !== null);
}

function formatChristianNewsDigest(headlines: ChristianNewsHeadline[]): string {
  return headlines.map(entry => `${entry.source}: ${entry.title}`).join(' | ');
}

function buildRecentPromptContext(
  bundles: GeneratedTopicBundle[],
  date: string
): Pick<GeneratedTopicPromptContext, 'recentTopicTitles' | 'recentPsalmReferences'> {
  const recentBundles = bundles
    .filter(bundle => bundle.date < date && isUsableGeneratedTopicBundle(bundle))
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 12);

  return {
    recentTopicTitles: recentBundles.map(bundle => bundle.topic.title),
    recentPsalmReferences: recentBundles.map(bundle => bundle.psalm?.psalmReference ?? '').filter(isNonEmptyString),
  };
}

async function fetchChristianNewsContext(date: string): Promise<ChristianNewsContext | null> {
  if (process.env.NODE_ENV === 'test') return null;
  // Only the currently published day should reflect live headlines; archive dates must stay stable.
  if (date !== getCurrentPublicationDate()) return null;

  const inFlight = inFlightChristianNews.get(date);
  if (inFlight) return inFlight;

  const request = (async () => {
    const results = await Promise.allSettled(
      CHRISTIAN_NEWS_FEEDS.slice(0, CHRISTIAN_NEWS_SOURCE_LIMIT).map(async feed => {
        const response = await fetch(feed.url, {
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
            'User-Agent': CHRISTIAN_NEWS_USER_AGENT,
          },
          signal: AbortSignal.timeout(CHRISTIAN_NEWS_TIMEOUT_MS),
        });

        if (!response.ok) {
          throw new Error(`News feed request failed with status ${response.status}`);
        }

        return parseChristianNewsFeed(await response.text(), feed.source);
      })
    );

    const headlines = results
      .flatMap(result => (result.status === 'fulfilled' ? result.value : []))
      .filter(entry => isNonEmptyString(entry.title))
      .sort((left, right) => (right.publishedAt ?? '').localeCompare(left.publishedAt ?? ''));

    const seen = new Set<string>();
    const uniqueHeadlines = headlines.filter(entry => {
      const key = entry.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (!uniqueHeadlines.length) return null;

    return {
      date,
      headlines: uniqueHeadlines.slice(0, CHRISTIAN_NEWS_HEADLINE_LIMIT),
    };
  })();

  inFlightChristianNews.set(date, request);

  try {
    return await request;
  } catch (error) {
    console.error('[generated-content] Aktuelle christliche Schlagzeilen konnten nicht geladen werden:', error);
    return null;
  } finally {
    inFlightChristianNews.delete(date);
  }
}

function buildGlaubenHeuteThema(date: string, currentEvents: ChristianNewsContext | null = null): GlaubenHeuteThema {
  const seed = currentTopicSeeds[getSeedIndex(date, currentTopicSeeds.length, 'topic')];
  const leadHeadline = currentEvents?.headlines[0]?.title;
  const newsDigest = currentEvents ? formatChristianNewsDigest(currentEvents.headlines) : null;

  return {
    id: `glauben-heute-${date}`,
    date,
    title: seed.title,
    headline: leadHeadline ? `${CURRENT_TOPIC_HEADLINE_PREFIX} ${leadHeadline}` : seed.headline,
    worldFocus: newsDigest
      ? `Heute prägen in der christlichen Landschaft unter anderem diese Entwicklungen die Wahrnehmung: ${newsDigest}. ${seed.worldFocus}`
      : seed.worldFocus,
    faithPerspective: newsDigest
      ? `${seed.faithPerspective} Gerade angesichts solcher Meldungen braucht die Kirche geistliche Unterscheidung, Gebet und nüchterne Hoffnung.`
      : seed.faithPerspective,
    discipleshipImpulse: newsDigest
      ? `${seed.discipleshipImpulse} Bete heute außerdem bewusst für Gemeinden, Verantwortliche und Betroffene, die hinter diesen Nachrichten stehen.`
      : seed.discipleshipImpulse,
    bibleVerses: [...seed.bibleVerses],
    questions: newsDigest
      ? [
        'Welche der aktuellen Entwicklungen in der christlichen Landschaft fordert mein Gebet und meine geistliche Unterscheidung heute besonders heraus?',
        ...seed.questions.slice(1),
      ]
      : [...seed.questions],
  };
}

function buildBuchempfehlungsSammlung(date: string): BuchempfehlungsSammlung {
  const seed = currentTopicSeeds[getSeedIndex(date, currentTopicSeeds.length, 'topic')];
  return {
    id: `buchliste-${date}`,
    date,
    topicTitle: seed.title,
    introduction: `Diese Buchempfehlungen greifen das Tagesthema „${seed.title}“ auf und helfen dabei, biblische Orientierung zu vertiefen.`,
    recommendations: seed.books.map((book: Buchempfehlung) => ({ ...book })),
  };
}


function buildGeneratedTopicBundle(
  date: string,
  currentEvents: ChristianNewsContext | null = null,
  source: GeneratedTopicSource = 'seed-fallback'
): GeneratedTopicBundle {
  return {
    id: `generated-topic-${date}`,
    date,
    source,
    createdAt: new Date().toISOString(),
    promptVersion: GENERATED_TOPIC_PROMPT_VERSION,
    psalm: buildPsalmThema(date),
    topic: buildGlaubenHeuteThema(date, currentEvents),
    books: buildBuchempfehlungsSammlung(date),
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown, minLength: number): value is string[] {
  return Array.isArray(value) && value.length >= minLength && value.every(isNonEmptyString);
}

function isBookRecommendation(value: unknown): value is Buchempfehlung {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    isNonEmptyString(candidate.title) &&
    isNonEmptyString(candidate.author) &&
    isNonEmptyString(candidate.description) &&
    isNonEmptyString(candidate.relevance)
  );
}

function isPsalmThema(value: unknown): value is PsalmThema {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.date) &&
    isNonEmptyString(candidate.psalmReference) &&
    isNonEmptyString(candidate.title) &&
    isNonEmptyString(candidate.excerpt) &&
    isNonEmptyString(candidate.summary) &&
    isNonEmptyString(candidate.significance) &&
    isNonEmptyString(candidate.practice) &&
    isStringArray(candidate.questions, 3)
  );
}

function isGlaubenHeuteThema(value: unknown): value is GlaubenHeuteThema {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.date) &&
    isNonEmptyString(candidate.title) &&
    isNonEmptyString(candidate.headline) &&
    isNonEmptyString(candidate.worldFocus) &&
    isNonEmptyString(candidate.faithPerspective) &&
    isNonEmptyString(candidate.discipleshipImpulse) &&
    isStringArray(candidate.bibleVerses, 3) &&
    isStringArray(candidate.questions, 3)
  );
}

function isBuchempfehlungsSammlung(value: unknown): value is BuchempfehlungsSammlung {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.date) &&
    isNonEmptyString(candidate.topicTitle) &&
    isNonEmptyString(candidate.introduction) &&
    Array.isArray(candidate.recommendations) &&
    candidate.recommendations.length >= 2 &&
    candidate.recommendations.every(isBookRecommendation)
  );
}

function isUsableGeneratedTopicBundle(bundle: GeneratedTopicBundle | undefined): bundle is GeneratedTopicBundle {
  return Boolean(
    bundle &&
    isNonEmptyString(bundle.id) &&
    isNonEmptyString(bundle.date) &&
    isNonEmptyString(bundle.createdAt) &&
    isNonEmptyString(bundle.promptVersion) &&
    isPsalmThema(bundle.psalm) &&
    isGlaubenHeuteThema(bundle.topic) &&
    isBuchempfehlungsSammlung(bundle.books)
  );
}

function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function parseAiBundle(date: string, rawText: string): GeneratedTopicBundle {
  const payload = JSON.parse(extractJsonPayload(rawText)) as Record<string, unknown>;
  const psalm = payload.psalm as Record<string, unknown> | undefined;
  const topic = payload.topic as Record<string, unknown> | undefined;
  const books = payload.books as Record<string, unknown> | undefined;

  if (!psalm || !topic || !books) {
    throw new Error('Antwort enthält kein psalm/topic/books-Objekt.');
  }

  if (
    !isNonEmptyString(psalm.psalmReference) ||
    !isNonEmptyString(psalm.title) ||
    !isNonEmptyString(psalm.excerpt) ||
    !isNonEmptyString(psalm.summary) ||
    !isNonEmptyString(psalm.significance) ||
    !isNonEmptyString(psalm.practice) ||
    !isStringArray(psalm.questions, 3)
  ) {
    throw new Error('Antwort enthält ein unvollständiges psalm-Objekt.');
  }

  if (
    !isNonEmptyString(topic.title) ||
    !isNonEmptyString(topic.headline) ||
    !isNonEmptyString(topic.worldFocus) ||
    !isNonEmptyString(topic.faithPerspective) ||
    !isNonEmptyString(topic.discipleshipImpulse) ||
    !isStringArray(topic.bibleVerses, 3) ||
    !isStringArray(topic.questions, 3)
  ) {
    throw new Error('Antwort enthält ein unvollständiges topic-Objekt.');
  }

  const recommendations = books.recommendations;
  const psalmReference = psalm.psalmReference as string;
  const psalmTitle = psalm.title as string;
  const psalmExcerpt = psalm.excerpt as string;
  const psalmSummary = psalm.summary as string;
  const psalmSignificance = psalm.significance as string;
  const psalmPractice = psalm.practice as string;
  const psalmQuestions = psalm.questions as string[];
  const bibleVerses = topic.bibleVerses as string[];
  const questions = topic.questions as string[];
  const title = topic.title as string;
  const headline = topic.headline as string;
  const worldFocus = topic.worldFocus as string;
  const faithPerspective = topic.faithPerspective as string;
  const discipleshipImpulse = topic.discipleshipImpulse as string;
  const topicTitle = books.topicTitle as string;
  const introduction = books.introduction as string;
  if (
    !isNonEmptyString(books.topicTitle) ||
    !isNonEmptyString(books.introduction) ||
    !Array.isArray(recommendations) ||
    recommendations.length < 2 ||
    !recommendations.every(isBookRecommendation)
  ) {
    throw new Error('Antwort enthält ein unvollständiges books-Objekt.');
  }

  return {
    id: `generated-topic-${date}`,
    date,
    source: 'ai',
    createdAt: new Date().toISOString(),
    promptVersion: GENERATED_TOPIC_PROMPT_VERSION,
    psalm: {
      id: `psalm-${date}`,
      date,
      psalmReference: psalmReference.trim(),
      title: psalmTitle.trim(),
      excerpt: psalmExcerpt.trim(),
      summary: psalmSummary.trim(),
      significance: psalmSignificance.trim(),
      practice: psalmPractice.trim(),
      questions: psalmQuestions.map(entry => entry.trim()),
    },
    topic: {
      id: `glauben-heute-${date}`,
      date,
      title: title.trim(),
      headline: headline.trim(),
      worldFocus: worldFocus.trim(),
      faithPerspective: faithPerspective.trim(),
      discipleshipImpulse: discipleshipImpulse.trim(),
      bibleVerses: bibleVerses.map(entry => entry.trim()),
      questions: questions.map(entry => entry.trim()),
    },
    books: {
      id: `buchliste-${date}`,
      date,
      topicTitle: topicTitle.trim(),
      introduction: introduction.trim(),
      recommendations: (recommendations as Buchempfehlung[]).map(book => ({
        title: book.title.trim(),
        author: book.author.trim(),
        description: book.description.trim(),
        relevance: book.relevance.trim(),
      })),
    },
  };
}

function getAiPrompt(date: string, context: GeneratedTopicPromptContext): string {
  const currentEventsBlock = context.currentEvents
    ? [
      'Aktuelle Schlagzeilen aus christlichen Medien (möglichst konkret aufgreifen):',
      ...context.currentEvents.headlines.map(entry => `- ${entry.source}: ${entry.title}`),
    ].join('\n')
    : 'Aktuelle Schlagzeilen aus christlichen Medien: Keine externen Schlagzeilen verfügbar. Formuliere trotzdem klar datiert und ohne generische Wiederholung.';

  const recentTitlesBlock = context.recentTopicTitles.length
    ? `Jüngste Tagesthemen zur Vermeidung von Wiederholungen:\n${context.recentTopicTitles.map(entry => `- ${entry}`).join('\n')}`
    : 'Jüngste Tagesthemen zur Vermeidung von Wiederholungen: Keine vorhanden.';

  const recentPsalmBlock = context.recentPsalmReferences.length
    ? `Zuletzt verwendete Psalmstellen (wenn möglich nicht sofort wiederholen):\n${context.recentPsalmReferences.map(entry => `- ${entry}`).join('\n')}`
    : 'Zuletzt verwendete Psalmstellen: Keine vorhanden.';

  return [
    `Erstelle für ${date} ein christliches Tagesthema für die Website Forschen.`,
    'Antworte ausschließlich als valides JSON ohne Markdown oder zusätzliche Erklärungen.',
    'Struktur:',
    JSON.stringify({
      psalm: {
        psalmReference: 'string',
        title: 'string',
        excerpt: 'string',
        summary: 'string',
        significance: 'string',
        practice: 'string',
        questions: ['string', 'string', 'string'],
      },
      topic: {
        title: 'string',
        headline: 'string',
        worldFocus: 'string',
        faithPerspective: 'string',
        discipleshipImpulse: 'string',
        bibleVerses: ['string', 'string', 'string'],
        questions: ['string', 'string', 'string'],
      },
      books: {
        topicTitle: 'string',
        introduction: 'string',
        recommendations: [
          {
            title: 'string',
            author: 'string',
            description: 'string',
            relevance: 'string',
          },
          {
            title: 'string',
            author: 'string',
            description: 'string',
            relevance: 'string',
          },
        ],
      },
    }),
    'Anforderungen:',
    '- Sprache: Deutsch.',
    '- Inhaltlich schriftnah, nüchtern, geistlich ernsthaft und passend zu freier christlicher Bibelforschung.',
    '- psalm.psalmReference muss eine echte Psalmstelle enthalten.',
    '- psalm.summary, psalm.significance und psalm.practice jeweils 2-4 Sätze.',
    '- psalm.excerpt soll ein kurzer prägnanter Satz aus oder über den Psalm sein.',
    '- Genau drei Psalm-Fragen.',
    '- worldFocus, faithPerspective und discipleshipImpulse jeweils 2-4 Sätze.',
    '- topic.title und topic.headline müssen sich klar von den jüngsten Tagesthemen unterscheiden und dürfen keine bloße Umformulierung davon sein.',
    '- Wenn aktuelle Schlagzeilen vorhanden sind, muss worldFocus mindestens eine konkrete Beobachtung aus der gegenwärtigen christlichen Landschaft aufnehmen.',
    '- Drei echte Bibelstellen als bibleVerses.',
    '- Genau drei vertiefende Fragen.',
    '- Genau zwei Buchempfehlungen.',
    '- books.topicTitle muss inhaltlich zu topic.title passen.',
    '- books.introduction darf nicht erwähnen, dass der Inhalt von KI erstellt wurde.',
    currentEventsBlock,
    recentTitlesBlock,
    recentPsalmBlock,
  ].join('\n');
}

function getOpenAiApiKey(): string | null {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

function shouldRefreshGeneratedTopicBundle(bundle: GeneratedTopicBundle | undefined): boolean {
  if (!bundle) return true;
  if (!isUsableGeneratedTopicBundle(bundle)) return true;
  const aiConfigured = Boolean(getOpenAiApiKey());
  if (!aiConfigured) {
    return bundle.source === 'seed-fallback' && bundle.promptVersion !== GENERATED_TOPIC_PROMPT_VERSION;
  }
  return bundle.source !== 'ai' || bundle.promptVersion !== GENERATED_TOPIC_PROMPT_VERSION;
}

async function generateTopicBundleWithAi(
  date: string,
  currentEvents: ChristianNewsContext | null = null
): Promise<GeneratedTopicBundle | null> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) return null;

  const [storedBundles, effectiveCurrentEvents] = await Promise.all([
    getGeneratedTopicBundlesFresh(),
    currentEvents ? Promise.resolve(currentEvents) : fetchChristianNewsContext(date),
  ]);
  const prompt = getAiPrompt(date, {
    ...buildRecentPromptContext(storedBundles, date),
    currentEvents: effectiveCurrentEvents,
  });

  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content:
                'Du erstellst christliche Themenimpulse für eine deutschsprachige Website. Gib ausschließlich JSON zurück.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!isNonEmptyString(content)) {
        throw new Error('OpenAI returned no content.');
      }

      return parseAiBundle(date, content);
    } catch (error) {
      if (attempt === AI_MAX_RETRIES) {
        console.error('[generated-content] KI-Generierung fehlgeschlagen:', error);
        return null;
      }
    }
  }

  return null;
}

async function persistGeneratedTopicBundle(bundle: GeneratedTopicBundle): Promise<GeneratedTopicBundle> {
  try {
    await saveGeneratedTopicBundle(bundle);
  } catch (error) {
    console.error('[generated-content] Persistieren des Tagesthemas fehlgeschlagen:', error);
  }
  return bundle;
}

async function getOrCreateGeneratedTopicBundle(date = getCurrentPublicationDate()): Promise<GeneratedTopicBundle> {
  const existing = await getGeneratedTopicBundleByDateFresh(date);
  if (existing && !shouldRefreshGeneratedTopicBundle(existing)) return existing;

  const inFlight = inFlightTopicGenerations.get(date);
  if (inFlight) return inFlight;

  const generation = (async () => {
    const currentEvents = await fetchChristianNewsContext(date);
    const generated = await generateTopicBundleWithAi(date, currentEvents);
    const bundle = generated
      ?? (isUsableGeneratedTopicBundle(existing) && existing.source === 'ai'
        ? existing
        : buildGeneratedTopicBundle(date, currentEvents));
    return persistGeneratedTopicBundle(bundle);
  })();

  inFlightTopicGenerations.set(date, generation);

  try {
    return await generation;
  } finally {
    inFlightTopicGenerations.delete(date);
  }
}

export async function getTodayPsalmThema(date = getCurrentPublicationDate()): Promise<PsalmThema> {
  const bundle = await getOrCreateGeneratedTopicBundle(date);
  return bundle.psalm ?? buildPsalmThema(date);
}

export async function getPsalmThemaArchiv(date = getCurrentPublicationDate()): Promise<PsalmThema[]> {
  const storedBundles = await getGeneratedTopicBundlesFresh();
  const bundlesByDate = new Map(
    storedBundles.map(bundle => [bundle.date, bundle] as const)
  );
  const todayBundle = await getOrCreateGeneratedTopicBundle(date);
  bundlesByDate.set(date, todayBundle);

  return buildDateList(date).map(entryDate => bundlesByDate.get(entryDate)?.psalm ?? buildPsalmThema(entryDate));
}

export async function getTodayGlaubenHeuteThema(date = getCurrentPublicationDate()): Promise<GlaubenHeuteThema> {
  const bundle = await getOrCreateGeneratedTopicBundle(date);
  return bundle.topic;
}

export async function getGlaubenHeuteArchiv(date = getCurrentPublicationDate()): Promise<GlaubenHeuteThema[]> {
  const storedBundles = await getGeneratedTopicBundlesFresh();
  const bundlesByDate = new Map(
    storedBundles.map(bundle => [bundle.date, bundle] as const)
  );
  const todayBundle = await getOrCreateGeneratedTopicBundle(date);
  bundlesByDate.set(date, todayBundle);

  return buildDateList(date).map(entryDate => (bundlesByDate.get(entryDate) ?? buildGeneratedTopicBundle(entryDate)).topic);
}

export async function getTodayBuchempfehlungen(date = getCurrentPublicationDate()): Promise<BuchempfehlungsSammlung> {
  const bundle = await getOrCreateGeneratedTopicBundle(date);
  return bundle.books;
}

export async function getBuchempfehlungenArchiv(date = getCurrentPublicationDate()): Promise<BuchempfehlungsSammlung[]> {
  const storedBundles = await getGeneratedTopicBundlesFresh();
  const bundlesByDate = new Map(
    storedBundles.map(bundle => [bundle.date, bundle] as const)
  );
  const todayBundle = await getOrCreateGeneratedTopicBundle(date);
  bundlesByDate.set(date, todayBundle);

  return buildDateList(date).map(entryDate => (bundlesByDate.get(entryDate) ?? buildGeneratedTopicBundle(entryDate)).books);
}
