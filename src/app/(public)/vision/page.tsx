export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

import Link from 'next/link';
import Image from 'next/image';
import BibleLink from '@/components/BibleLink';
import { founderProfile } from '@/lib/founder-profile';
import { createPageMetadata } from '@/lib/seo';

const sections = [
  {
    icon: '📖',
    title: 'Eine Plattform für ehrliche Fragen',
    text: 'Der Fluss des Lebens entstand aus dem Wunsch, einen Raum zu schaffen, in dem die Heilige Schrift ernst genommen wird – nicht als Steinbruch für Zitate, sondern als lebendiges Zeugnis, das uns heute noch herausfordert und tröstet. Hier ist Platz für Zweifel, für Tiefe und für echte Begegnung mit dem Text.',
  },
  {
    icon: '🔬',
    title: 'Forschung ohne Konkurrenz',
    text: 'Wir glauben, dass theologische Forschung keine Bühne für Selbstdarstellung ist. Deshalb gibt es hier keine Likes, keine Rankings, keine Follower. Was zählt, ist die Qualität des Gedankens und die Ernsthaftigkeit des Suchens. Eine These kann von einem Erstklässler kommen oder von einem promovierten Theologen – was zählt, ist der Inhalt.',
  },
  {
    icon: '🙏',
    title: 'Gemeinschaft in der Tiefe',
    text: 'Christlicher Glaube war nie ein Einzelsport. Diese Plattform soll verbinden: Menschen, die ernsthaft fragen, gemeinsam beten und sich gegenseitig in ihrem Glaubensweg unterstützen. Der Gebetsraum ist bewusst geschützt – nicht um Exklusivität zu fördern, sondern um einen Raum für Verletzlichkeit zu schaffen.',
  },
  {
    icon: '🗓️',
    title: 'Das Tageswort und das Wochenthema',
    text: 'Täglich erscheint ein Bibelvers mit fünf Forschungsfragen – nicht um Antworten zu geben, sondern um das Nachdenken anzuregen. Einmal pro Woche vertiefen wir ein theologisches Thema mit Textbelegen, historischen Fragen und einer Einladung zur Forschung. Die Plattform ist ein Werkzeug für persönliche und gemeinschaftliche Bibelarbeit.',
  },
  {
    icon: '🎁',
    title: 'Privat und kostenlos',
    text: 'Der Fluss des Lebens ist eine private Forschungsplattform und bleibt kostenlos. Es gibt keine Premium-Stufen, keine Bezahlschranken. Wer unterstützen möchte, kann spenden – aber niemand soll aus Geldmangel ausgeschlossen sein. Das entspricht unserer Überzeugung: Das Evangelium ist für alle.',
  },
];

const values = [
  { icon: '📜', label: 'Schrifttreue' },
  { icon: '🤝', label: 'Gemeinschaft' },
  { icon: '🔍', label: 'Ehrlichkeit' },
  { icon: '🕊️', label: 'Freiheit' },
  { icon: '💡', label: 'Tiefe' },
  { icon: '❤️', label: 'Liebe' },
];

export const metadata: Metadata = createPageMetadata({
  title: 'Vision und Werte',
  description: 'Lerne die Vision, Werte und geistliche Ausrichtung von Der Fluss des Lebens kennen.',
  path: '/vision',
  keywords: ['Vision', 'Werte', 'christliche Plattform'],
});

export default function VisionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-5">
          <span className="text-3xl">✦</span>
        </div>
        <h1 className="text-4xl font-bold text-blue-800 mb-3">Unsere Vision</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Was ist Der Fluss des Lebens – und warum gibt es diese Plattform?
        </p>
      </div>

      {/* Scripture quote */}
      <blockquote className="border-l-4 border-blue-500 pl-5 py-3 bg-blue-50 rounded-r-xl text-gray-700 italic mb-14 text-lg">
        &ldquo;Wer mich dürstet, der komme zu mir und trinke!&rdquo;
        <span className="block mt-1 text-sm not-italic text-gray-500">
          <BibleLink text="Johannes 7,37" />
        </span>
      </blockquote>

      {/* Sections */}
      <div className="space-y-5 mb-14">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-md p-6 flex gap-5 items-start">
            <div className="text-3xl flex-shrink-0 mt-0.5">{section.icon}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Values grid */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Unsere Werte</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {values.map((value) => (
            <div key={value.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{value.icon}</span>
              <span className="font-semibold text-gray-700">{value.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="lg:w-2/3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 mb-3">Über mich</p>
              <h2 className="text-3xl font-bold text-blue-800 mb-2">{founderProfile.name}</h2>
              <p className="text-sm font-semibold text-amber-600 mb-4">{founderProfile.role}</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{founderProfile.visionParagraphs.intro}</p>
                <p>
                  In meinem Buch <strong>{founderProfile.book.title}</strong> {founderProfile.visionParagraphs.book}
                </p>
                <p>{founderProfile.visionParagraphs.calling}</p>
              </div>
            </div>

            <aside className="lg:w-1/3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
                <a
                  href={founderProfile.book.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  aria-label={`${founderProfile.book.title} auf Amazon ansehen`}
                >
                  <Image
                    src={founderProfile.book.imagePath}
                    alt={founderProfile.book.alt}
                    width={260}
                    height={375}
                    className="mx-auto mb-4 aspect-[2/3] w-full max-w-[260px] rounded-xl border border-blue-200 bg-white object-cover shadow-md"
                  />
                </a>
                <h3 className="text-lg font-semibold text-blue-900">{founderProfile.book.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{founderProfile.book.subtitle}</p>
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                  {founderProfile.visionAside}
                </p>
                <a
                  href={founderProfile.book.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center rounded-full bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Auf Amazon ansehen
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-800 text-white rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Gemeinsam forschen</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Werde Teil der Gemeinschaft. Teile deine Gedanken, Thesen und Gebete – kostenlos und ohne Druck.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/registrieren" className="bg-white text-blue-800 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Jetzt registrieren
          </Link>
          <Link href="/tageswort" className="border border-white text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Zum Tageswort
          </Link>
        </div>
      </section>
    </div>
  );
}
