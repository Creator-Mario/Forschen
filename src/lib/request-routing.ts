const WWW_PREFIX = 'www.';
const legacyAmpRedirects = new Map<string, string>([
  ['/amp/glauben-heute', '/glauben-heute'],
  ['/amp/psalmen', '/psalmen'],
  ['/amp/tageswort', '/tageswort'],
  ['/amp/wochenthema', '/wochenthema'],
]);

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

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
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

export function getLegacyAmpRedirectDestination(
  requestUrl: string,
  canonicalSiteUrl: string,
): string | null {
  try {
    const redirectUrl = new URL(requestUrl);
    const normalizedPathname = normalizePathname(redirectUrl.pathname);
    const destinationPath = legacyAmpRedirects.get(normalizedPathname);

    if (!destinationPath) {
      return null;
    }

    const canonicalUrl = new URL(canonicalSiteUrl);
    redirectUrl.protocol = canonicalUrl.protocol;
    redirectUrl.host = canonicalUrl.host;
    redirectUrl.pathname = destinationPath;

    return redirectUrl.toString();
  } catch {
    return null;
  }
}
