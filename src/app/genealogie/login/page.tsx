import type { Metadata } from 'next';
import GenealogiePreviewCards from '@/components/GenealogiePreviewCards';
import ImageHero from '@/components/ImageHero';
import LoginFormCard from '@/components/LoginFormCard';
import { canonicalSiteUrl, siteName } from '@/lib/config';
import { genealogyPageSubtitle, genealogyPageTitle } from '@/lib/genealogie';
import { defaultOgImage } from '@/lib/seo';

const pageTitle = genealogyPageTitle;
const pageDescription =
  'Entdecke deine Glaubenswurzeln mit täglichen Impulsen, persönlichem Segen und geschützter Gemeinschaft – kostenlos und ohne versteckte Kosten.';
const pagePath = '/genealogie/login' as const;

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
};

export default function GenealogieLoginPage() {
  return (
    <div className="bg-gradient-to-b from-[#eff6ff] via-[#f8fafc] to-white">
      <ImageHero
        title={genealogyPageTitle}
        subtitle={genealogyPageSubtitle}
      />

      <section className="px-4 pb-20 pt-10 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)] lg:items-start">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-blue-100 bg-white/80 p-7 shadow-[0_30px_80px_-45px_rgba(30,58,138,0.45)] backdrop-blur-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">Kostenloser Einblick</p>
              <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
                Eine einladende Vorschau auf deine geistliche Genealogie
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                Bevor du dich anmeldest, siehst du bereits, was dich erwartet: geistliche Gemeinschaft, biblische
                Vertiefung, persönliche Impulse und ehrliche Gespräche über Glauben, Zweifel und Hoffnung.
              </p>
              <div className="mt-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                Kostenlos nutzbar – ohne versteckte Kosten
              </div>
            </div>

            <GenealogiePreviewCards />
          </div>

          <div className="lg:sticky lg:top-10">
            <LoginFormCard />
          </div>
        </div>
      </section>
    </div>
  );
}
