export const publicIndexablePages = [
  { href: '/', label: 'Startseite', changeFrequency: 'daily', priority: 1 },
  { href: '/vision', label: 'Unsere Vision', changeFrequency: 'monthly', priority: 0.9 },
  { href: '/tageswort', label: 'Tageswort', changeFrequency: 'daily', priority: 0.9 },
  { href: '/tageswort/archiv', label: 'Tageswort Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/wochenthema', label: 'Wochenthema', changeFrequency: 'weekly', priority: 0.9 },
  { href: '/wochenthema/archiv', label: 'Wochenthema Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/thesen', label: 'Thesen', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/psalmen', label: 'Psalmen', changeFrequency: 'daily', priority: 0.8 },
  { href: '/psalmen/archiv', label: 'Psalmen Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/glauben-heute', label: 'Glauben heute', changeFrequency: 'daily', priority: 0.8 },
  { href: '/glauben-heute/archiv', label: 'Glauben heute Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/buchempfehlungen', label: 'Buchempfehlungen', changeFrequency: 'daily', priority: 0.8 },
  { href: '/buchempfehlungen/archiv', label: 'Buchempfehlungen Archiv', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/forschung', label: 'Bibelforschung', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/videos', label: 'Videos', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/aktionen', label: 'Aktionen & Treffen', changeFrequency: 'weekly', priority: 0.8 },
  { href: '/gebet', label: 'Gebet', changeFrequency: 'monthly', priority: 0.6 },
  { href: '/spenden', label: 'Unterstützen', changeFrequency: 'monthly', priority: 0.6 },
  { href: '/impressum', label: 'Impressum', changeFrequency: 'yearly', priority: 0.3 },
  { href: '/datenschutz', label: 'Datenschutz', changeFrequency: 'yearly', priority: 0.3 },
] as const;

export const footerPageGroups = [
  {
    title: 'Inhalte',
    links: publicIndexablePages.filter((page) =>
      [
        '/',
        '/vision',
        '/tageswort',
        '/wochenthema',
        '/psalmen',
        '/glauben-heute',
        '/thesen',
        '/forschung',
        '/videos',
        '/aktionen',
        '/gebet',
      ].includes(page.href),
    ),
  },
  {
    title: 'Archive & Service',
    links: publicIndexablePages.filter((page) =>
      [
        '/tageswort/archiv',
        '/wochenthema/archiv',
        '/psalmen/archiv',
        '/glauben-heute/archiv',
        '/buchempfehlungen',
        '/buchempfehlungen/archiv',
        '/spenden',
        '/impressum',
        '/datenschutz',
      ].includes(page.href),
    ),
  },
] as const;
