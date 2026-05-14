import type { Metadata } from 'next';
import GenealogiePreviewCards from '@/components/GenealogiePreviewCards';
import ImageHero from '@/components/ImageHero';
import RegisterFormCard from '@/components/RegisterFormCard';
import { canonicalSiteUrl, siteName } from '@/lib/config';
import { defaultOgImage } from '@/lib/seo';

const pageTitle = 'Der Fluss des Lebens – Meine geistliche Ahnenreihe';
const pageDescription =
  'Registriere dich kostenlos für deine geistliche Ahnenreihe mit täglichem Impuls, wöchentlichem Segen und geschützter Gemeinschaft.';
const pagePath = '/genealogie/registrieren' as const;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: `${canonicalSiteUrl}${pagePath}`,
    siteName,
    title: pageTitle,
    description: pageDescription,
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [defaultOgImage.url],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function GenealogieRegistrierenPage() {
  return (
    <div className="bg-gradient-to-b from-[#eff6ff] via-[#f8fafc] to-white">
      <ImageHero
        title="Der Fluss des Lebens – Meine geistliche Ahnenreihe"
        subtitle="Entdecke deine Glaubenswurzeln. Täglich Impulse. Wöchentlich persönlicher Segen. Kostenlos."
      />

      <section className="px-4 pb-20 pt-10 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)] lg:items-start">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-blue-100 bg-white/80 p-7 shadow-[0_30px_80px_-45px_rgba(30,58,138,0.45)] backdrop-blur-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">Dein Start</p>
              <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
                Trete einer ruhigen, geistlich ausgerichteten Gemeinschaft bei
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                Die Genealogie-Funktion verbindet persönliche Glaubensgeschichte mit Bibelimpulsen, Gebet und echter
                Gemeinschaft. Deine Registrierung bleibt kostenfrei und transparent.
              </p>
              <div className="mt-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                Kostenlos anmelden – ohne Abo und ohne versteckte Gebühren
              </div>
            </div>

            <GenealogiePreviewCards />
          </div>

          <div className="lg:sticky lg:top-10">
            <RegisterFormCard />
          </div>
        </div>
      </section>
    </div>
  );
}
