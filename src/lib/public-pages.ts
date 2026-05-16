export const publicIndexablePages = [
  { href: '/', label: 'Startseite', changeFrequency: 'daily', priority: 1 },
  { href: '/vision', label: 'Unsere Vision', changeFrequency: 'monthly', priority: 0.9 },
  { href: '/tageswort', label: 'Tageswort', changeFrequency: 'daily', priority: 0.9 },
  { href: '/predigt', label: 'Tagespredigt', changeFrequency: 'daily', priority: 0.85 },
  { href: '/archiv', label: 'Predigt Archiv', changeFrequency: 'daily', priority: 0.75 },
  { href: '/tageswort/archiv', label: 'Tageswort Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/wochenthema', label: 'Wochenthema', changeFrequency: 'weekly', priority: 0.9 },
  { href: '/wochenthema/archiv', label: 'Wochenthema Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/thesen', label: 'Thesen', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/thesen/archiv', label: 'Thesen Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/psalmen', label: 'Psalmen', changeFrequency: 'daily', priority: 0.8 },
  { href: '/psalmen/archiv', label: 'Psalmen Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/glauben-heute', label: 'Glauben heute', changeFrequency: 'daily', priority: 0.8 },
  { href: '/glauben-heute/archiv', label: 'Glauben heute Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/buchempfehlungen', label: 'Buchempfehlungen', changeFrequency: 'daily', priority: 0.8 },
  { href: '/buchempfehlungen/archiv', label: 'Buchempfehlungen Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/forschung', label: 'Bibelforschung', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/forschung/archiv', label: 'Forschungsarchiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/videos', label: 'Videos', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/aktionen', label: 'Aktionen & Treffen', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/gebet', label: 'Gebet', changeFrequency: 'monthly', priority: 0.6 },
  { href: '/genealogie/login', label: 'Genealogie Login', changeFrequency: 'weekly', priority: 0.65 },
  { href: '/genealogie/registrieren', label: 'Genealogie Registrierung', changeFrequency: 'weekly', priority: 0.65 },
  { href: '/spenden', label: 'Unterstützen', changeFrequency: 'monthly', priority: 0.6 },
  { href: '/impressum', label: 'Impressum', changeFrequency: 'yearly', priority: 0.3 },
  { href: '/datenschutz', label: 'Datenschutz', changeFrequency: 'yearly', priority: 0.3 },
] as const;

type PublicIndexablePage = (typeof publicIndexablePages)[number];

const privateArchiveHrefs = new Set([
  '/archiv',
  '/tageswort/archiv',
  '/wochenthema/archiv',
  '/thesen/archiv',
  '/psalmen/archiv',
  '/glauben-heute/archiv',
  '/buchempfehlungen/archiv',
  '/forschung/archiv',
]);

export async function getSitemapPublicPages(): Promise<readonly PublicIndexablePage[]> {
  return publicIndexablePages.filter((page) => !privateArchiveHrefs.has(page.href));
}

export const footerPageGroups = [
  {
    title: 'Inhalte',
    links: publicIndexablePages.filter((page) =>
      [
        '/',
        '/vision',
        '/tageswort',
        '/predigt',
        '/wochenthema',
        '/psalmen',
        '/glauben-heute',
        '/thesen',
        '/forschung',
        '/videos',
        '/aktionen',
        '/gebet',
        '/genealogie/login',
        '/genealogie/registrieren',
      ].includes(page.href),
    ),
  },
  {
    title: 'Archive & Service',
    links: publicIndexablePages.filter((page) =>
      [
        '/tageswort/archiv',
        '/archiv',
        '/wochenthema/archiv',
        '/thesen/archiv',
        '/psalmen/archiv',
        '/glauben-heute/archiv',
        '/buchempfehlungen',
        '/buchempfehlungen/archiv',
        '/forschung/archiv',
        '/spenden',
        '/impressum',
        '/datenschutz',
      ].includes(page.href),
    ),
  },
] as const;
