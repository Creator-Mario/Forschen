export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import BibleVerseCard from '@/components/BibleVerseCard';
import WeeklyThemeCard from '@/components/WeeklyThemeCard';
import PsalmThemeCard from '@/components/PsalmThemeCard';
import CurrentTopicCard from '@/components/CurrentTopicCard';
import BookRecommendationsCard from '@/components/BookRecommendationsCard';
import QrShareActions from '@/components/QrShareActions';
import Logo from '@/components/Logo';
import { canonicalSiteUrl, siteName } from '@/lib/config';
import { getTodayTageswort, getCurrentWochenthema, getApprovedThesen } from '@/lib/db';
import { getTodayPsalmThema, getTodayGlaubenHeuteThema, getTodayBuchempfehlungen } from '@/lib/generated-content';
import { founderProfile } from '@/lib/founder-profile';

export default function HomePage() {
  const tageswort = getTodayTageswort();
  const wochenthema = getCurrentWochenthema();
  const thesen = getApprovedThesen().slice(0, 2);
  const psalmThema = getTodayPsalmThema();
  const glaubenHeute = getTodayGlaubenHeuteThema();
  const buchempfehlungen = getTodayBuchempfehlungen();

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden text-white py-20 px-4"
        style={{
          background: 'linear-gradient(160deg, #0d47a1 0%, #1565c0 50%, #1976d2 80%, #2196f3 100%)',
        }}
      >
        {/* Animated wave layers */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full opacity-30 wave-layer" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 C1300,90 1380,40 1440,60 L1440,120 L0,120 Z" fill="#64b5f6" />
          </svg>
          <svg className="absolute bottom-0 w-full opacity-20 wave-layer wave-layer-2" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,80 C180,20 360,100 540,80 C720,60 900,100 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z" fill="#b3d9f9" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo size={100} />
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-3 leading-tight font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          >
            <span style={{ color: '#fbbf24' }}>Der Fluss</span>
            <span className="text-white"> des Lebens</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Eine private Plattform für ernsthafte christliche Bibelforschung – ohne Gamification, ohne Rankings, nur echte Fragen und ehrliche Suche.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tageswort"
              className="px-8 py-3 rounded-full font-semibold text-base transition-all shadow-lg hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f5a623, #fbbf24)', color: '#072860' }}
            >
              Zum Tageswort
            </Link>
            <Link
              href="/vision"
              className="px-8 py-3 rounded-full font-semibold text-base border-2 border-white text-white hover:bg-white hover:text-river-900 transition-all"
            >
              Unsere Vision
            </Link>
          </div>
        </div>

        {/* Wave transition to body */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden [line-height:0]">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-20 block">
            <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z" fill="#e8f4fd" />
          </svg>
        </div>
      </section>

      <section className="border-b border-blue-100 bg-gradient-to-b from-[#f4f9ff] via-white to-[#f9fbff]">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">
              Vorstellung des Administrators
            </p>
            <h2 className="text-3xl font-bold text-blue-900 font-serif md:text-4xl">
              {founderProfile.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
              Ein fester Bestandteil der Startseite: Wer die Plattform verantwortet, welche geistliche Haltung sie prägt und warum ihre Ausrichtung bewusst schriftbezogen und ruhig bleibt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
                  {founderProfile.role}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Geistliche Leitung & Verantwortung
                </span>
              </div>

              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-gray-800 md:text-2xl">
                {founderProfile.tagline}
              </p>

              <div className="mt-8 space-y-5 text-base leading-8 text-gray-700">
                <p>{founderProfile.shortBio}</p>
                {founderProfile.homeSummary.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 border-l-4 border-amber-400 bg-white/70 px-5 py-4 text-sm leading-7 text-gray-700">
                {founderProfile.publicPositioning}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/vision"
                  className="inline-flex items-center rounded-full bg-blue-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {founderProfile.book.ctaLabel}
                </Link>
                <Link
                  href="/registrieren"
                  className="inline-flex items-center rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  Kostenlos registrieren
                </Link>
              </div>
            </div>

            <aside className="lg:border-l lg:border-blue-100 lg:pl-10">
              <div className="mx-auto max-w-[340px]">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
                  Publikation des Administrators
                </p>
                <div className="overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white">
                  <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50 p-5">
                    <Image
                      src={founderProfile.book.imagePath}
                      alt={founderProfile.book.alt}
                      width={320}
                      height={462}
                      className="h-auto w-full rounded-xl border border-blue-100"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-blue-900">
                      {founderProfile.book.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {founderProfile.book.subtitle}
                    </p>
                    <p className="mt-5 text-sm leading-7 text-gray-700">
                      Das Buch steht für den Anspruch der Plattform: geistliche Reife, persönliche Verantwortung und eine ernsthafte, ruhige Auseinandersetzung mit der Heiligen Schrift.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Today + Weekly ── */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div>
            {tageswort ? (
              <BibleVerseCard tageswort={tageswort} />
            ) : (
              <div className="card-river p-6 text-gray-500 text-center">Kein Tageswort verfügbar</div>
            )}
          </div>
          <div>
            {wochenthema ? (
              <WeeklyThemeCard theme={wochenthema} compact />
            ) : (
              <div className="card-river p-6 text-gray-500 text-center">Kein Wochenthema verfügbar</div>
            )}
          </div>
        </div>

        <div className="mb-14">
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 md:p-7 flex flex-col md:flex-row items-center gap-6">
            <Image
              src="/api/share-qr"
              alt="QR-Code zum Teilen der Website"
              width={144}
              height={144}
              className="w-36 h-36 rounded-xl border border-blue-100 bg-blue-50 p-2"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-blue-800 mb-2 font-serif">
                Freunde zur Webseite einladen
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Teile diesen QR-Code, damit Freunde die Webseite direkt öffnen und die wichtigsten Informationen schnell erreichen.
              </p>
              <div className="space-y-1 mb-4">
                <p className="text-sm font-semibold text-gray-800">{siteName}</p>
                <p className="text-xs text-gray-500 break-all">{canonicalSiteUrl}</p>
              </div>
              <QrShareActions siteUrl={canonicalSiteUrl} />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-2 text-blue-800 font-serif"
          >
            Impulse für heute
          </h2>
          <p className="text-center text-blue-400 text-sm mb-8">
            Psalm, Tagesthema und passende Literatur – kompakt auf einen Blick
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <PsalmThemeCard item={psalmThema} compact />
              <Link href="/psalmen" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                Zum Psalm des Tages →
              </Link>
            </div>
            <div className="space-y-2">
              <CurrentTopicCard item={glaubenHeute} compact />
              <Link href="/glauben-heute" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                Zum Tagesthema →
              </Link>
            </div>
            <div className="space-y-2">
              <BookRecommendationsCard collection={buchempfehlungen} compact />
              <Link href="/buchempfehlungen" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                Zu den Empfehlungen →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features wave section ── */}
      <div
        className="relative py-16 px-4"
        style={{ background: 'linear-gradient(180deg, #e3f2fd 0%, #f0f7ff 100%)' }}
      >
        {/* Top wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden rotate-180 [line-height:0]">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z" fill="#e3f2fd" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-2 heading-gold-line text-blue-800 font-serif"
          >
            Bereiche der Plattform
          </h2>
          <p className="text-center text-blue-400 text-sm mb-10">Entdecke alle Forschungsbereiche</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { href: '/tageswort', icon: '📖', title: 'Tageswort', desc: 'Täglich ein Bibelvers mit fünf Forschungsfragen zur Vertiefung.' },
              { href: '/psalmen', icon: '🎼', title: 'Psalmen', desc: 'Täglich ein Psalmimpuls zur Erforschung von Trost, Klage und Hoffnung.' },
              { href: '/wochenthema', icon: '🔍', title: 'Wochenthema', desc: 'Ein theologisches Thema pro Woche mit Schriftbelegen und offenen Fragen.' },
              { href: '/glauben-heute', icon: '🕊️', title: 'Glauben heute', desc: 'Täglich ein aktueller Impuls zu Fragen von Glaube, Weltgeschehen und Nachfolge.' },
              { href: '/buchempfehlungen', icon: '📚', title: 'Buchempfehlungen', desc: 'Passende Literatur zu aktuellen Themen und freigegebene Empfehlungen aus der Gemeinschaft.' },
              { href: '/thesen', icon: '💡', title: 'Thesen', desc: 'Theologische Kernaussagen aus der Gemeinschaft zur Diskussion.' },
              { href: '/forschung', icon: '📝', title: 'Bibelforschung', desc: 'Tiefgehende Beiträge zur Exegese und Hermeneutik.' },
              { href: '/gebet', icon: '🙏', title: 'Gebetsraum', desc: 'Ein geschützter Raum für persönliche und gemeinsame Gebete.' },
              { href: '/aktionen', icon: '🤝', title: 'Aktionen', desc: 'Gemeinschaftliche Aktivitäten und Treffen in der Realen Welt.' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="card-river p-6 hover:shadow-xl transition-all group flex flex-col"
                style={{ borderRadius: '1.2rem' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3
                  className="font-semibold mb-2 text-blue-800 group-hover:text-blue-700 transition-colors"
                >
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                <div
                  className="mt-4 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: '#f5a623' }}
                >
                  Mehr erfahren <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Thesen ── */}
      {thesen.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-blue-800 font-serif"
            >
              Aktuelle Thesen
            </h2>
            <Link href="/thesen" className="text-sm font-semibold transition-colors" style={{ color: '#f5a623' }}>
              Alle Thesen →
            </Link>
          </div>
          <div className="space-y-4">
            {thesen.map(t => (
              <div
                key={t.id}
                className="card-river p-6"
                style={{ borderLeft: '4px solid #2196f3' }}
              >
                <h3 className="font-semibold text-gray-800 mb-2">{t.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.content.substring(0, 200)}…</p>
                <div className="mt-3 text-xs text-gray-400">{t.authorName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="px-4 pb-16">
        <div
          className="max-w-4xl mx-auto text-white rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #2196f3 100%)',
            boxShadow: '0 20px 60px rgba(13,71,161,0.35)',
          }}
        >
          {/* Decorative waves */}
          <div className="absolute bottom-0 left-0 w-full opacity-20 [line-height:0]">
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12">
              <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#64b5f6" />
            </svg>
          </div>
          <div className="relative z-10">
            <Logo size={64} />
            <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-3 font-serif">
              Mitmachen und forschen
            </h2>
            <p className="text-blue-100 mb-7 max-w-xl mx-auto">
              Registriere dich kostenlos und teile deine Forschungsbeiträge, Thesen und Gebete mit der Gemeinschaft.
            </p>
            <Link
              href="/registrieren"
              className="inline-block px-8 py-3 rounded-full font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f5a623, #fbbf24)', color: '#072860' }}
            >
              Jetzt kostenlos registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
