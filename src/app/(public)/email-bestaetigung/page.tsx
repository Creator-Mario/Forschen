export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserByEmailTokenFresh } from '@/lib/db';
import { createNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = createNoIndexMetadata(
  'E-Mail-Bestätigung',
  'Seite zum Bestätigen einer Registrierung per E-Mail-Link.',
  '/email-bestaetigung',
);

type EmailBestaetigungPageProps = {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

function normalizeToken(token: string | string[] | undefined): string {
  return (Array.isArray(token) ? token[0] : token ?? '').trim();
}

function InvalidVerificationView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-md">
        <div className="text-center">
          <div className="mb-4 text-4xl text-red-500">✉️</div>
          <h1 className="mb-3 text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-600">{description}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/registrieren"
              className="inline-flex items-center justify-center rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Zur Registrierung
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EmailBestaetigungPage({ searchParams }: EmailBestaetigungPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = normalizeToken(resolvedSearchParams?.token);

  if (!token) {
    return (
      <InvalidVerificationView
        title="Bestätigungslink unvollständig"
        description="In diesem Link fehlt der Bestätigungscode. Bitte öffne den vollständigen Link aus deiner E-Mail erneut oder starte die Registrierung noch einmal."
      />
    );
  }

  const user = await getUserByEmailTokenFresh(token);
  if (!user) {
    return (
      <InvalidVerificationView
        title="Bestätigungslink ungültig"
        description="Dieser Registrierungslink ist ungültig oder nicht mehr verfügbar. Bitte starte die Registrierung erneut, damit wir dir einen frischen Bestätigungslink senden können."
      />
    );
  }

  if (user.status === 'pending_email') {
    redirect(`/api/auth/verify-email/complete?token=${encodeURIComponent(token)}`);
  }

  if (user.status === 'email_verified') {
    redirect(`/api/auth/verify-email/complete?token=${encodeURIComponent(token)}`);
  }

  redirect('/login');
}
