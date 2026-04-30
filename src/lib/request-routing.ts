const WWW_PREFIX = 'www.';

const protectedPathPrefixes = [
  '/dashboard',
  '/mein-tageswort',
  '/meine-buchempfehlungen',
  '/meine-thesen',
  '/meine-gebete',
  '/thesen/neu',
  '/buchempfehlungen/neu',
  '/forschung/beitraege',
  '/gebet/neu',
  '/chat',
  '/aktionen/neu',
  '/videos/hochladen',
  '/profil',
  '/admin',
] as const;

export function normalizeHost(host: string | null | undefined): string {
  return host?.split(',')[0]?.trim().toLowerCase().replace(/:\d+$/, '') ?? '';
}

export function getApexHost(host: string): string {
  return host.startsWith(WWW_PREFIX) ? host.slice(WWW_PREFIX.length) : host;
}

export function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

type CanonicalHostRedirectOptions = {
  requestUrl: string;
  requestHost: string | null | undefined;
  canonicalSiteUrl: string;
};

export function getCanonicalHostRedirectDestination({
  requestUrl,
  requestHost,
  canonicalSiteUrl,
}: CanonicalHostRedirectOptions): string | null {
  const normalizedRequestHost = normalizeHost(requestHost);

  try {
    const canonicalUrl = new URL(canonicalSiteUrl);
    const canonicalHost = normalizeHost(canonicalUrl.host);
    const apexHost = getApexHost(canonicalHost);
    const redirectUrl = new URL(requestUrl);
    const requestUrlHost = normalizeHost(redirectUrl.host);
    const resolvedRequestHost = normalizedRequestHost || requestUrlHost;

    if (!canonicalHost || canonicalHost === apexHost) {
      return null;
    }

    if (requestUrlHost === canonicalHost || resolvedRequestHost !== apexHost) {
      return null;
    }

    redirectUrl.protocol = canonicalUrl.protocol;
    redirectUrl.host = canonicalUrl.host;
    const redirectDestination = redirectUrl.toString();

    return redirectDestination === requestUrl ? null : redirectDestination;
  } catch {
    return null;
  }
}
