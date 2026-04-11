import type {
  PsalmThema,
  GlaubenHeuteThema,
  Buchempfehlung,
  BuchempfehlungsSammlung,
} from '@/types';

const MS_PER_DAY = 86400000;
// Business rule: generated daily archives stay browsable for 90 days.
const GENERATED_ARCHIVE_DAYS = 90;

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

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysSinceEpoch(date: string): number {
  return Math.floor(parseIsoDate(date).getTime() / MS_PER_DAY);
}

function getSeedIndex(date: string, length: number): number {
  const index = daysSinceEpoch(date) % length;
  return index >= 0 ? index : index + length;
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
  const seed = psalmSeeds[getSeedIndex(date, psalmSeeds.length)];
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

function buildGlaubenHeuteThema(date: string): GlaubenHeuteThema {
  const seed = currentTopicSeeds[getSeedIndex(date, currentTopicSeeds.length)];
  return {
    id: `glauben-heute-${date}`,
    date,
    title: seed.title,
    headline: seed.headline,
    worldFocus: seed.worldFocus,
    faithPerspective: seed.faithPerspective,
    discipleshipImpulse: seed.discipleshipImpulse,
    bibleVerses: [...seed.bibleVerses],
    questions: [...seed.questions],
  };
}

function buildBuchempfehlungsSammlung(date: string): BuchempfehlungsSammlung {
  const seed = currentTopicSeeds[getSeedIndex(date, currentTopicSeeds.length)];
  return {
    id: `buchliste-${date}`,
    date,
    topicTitle: seed.title,
    introduction: `Diese KI-inspirierten Buchempfehlungen greifen das Tagesthema „${seed.title}“ auf und helfen dabei, biblische Orientierung zu vertiefen.`,
    recommendations: seed.books.map((book: Buchempfehlung) => ({ ...book })),
  };
}

export function getTodayPsalmThema(date = toIsoDate(new Date())): PsalmThema {
  return buildPsalmThema(date);
}

export function getPsalmThemaArchiv(date = toIsoDate(new Date())): PsalmThema[] {
  return buildDateList(date).map(buildPsalmThema);
}

export function getTodayGlaubenHeuteThema(date = toIsoDate(new Date())): GlaubenHeuteThema {
  return buildGlaubenHeuteThema(date);
}

export function getGlaubenHeuteArchiv(date = toIsoDate(new Date())): GlaubenHeuteThema[] {
  return buildDateList(date).map(buildGlaubenHeuteThema);
}

export function getTodayBuchempfehlungen(date = toIsoDate(new Date())): BuchempfehlungsSammlung {
  return buildBuchempfehlungsSammlung(date);
}

export function getBuchempfehlungenArchiv(date = toIsoDate(new Date())): BuchempfehlungsSammlung[] {
  return buildDateList(date).map(buildBuchempfehlungsSammlung);
}
