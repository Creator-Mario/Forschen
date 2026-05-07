import legacyAmpCanonicalPaths from '@/lib/legacy-amp-canonical-paths.json';

const WWW_PREFIX = 'www.';
const legacyAmpRedirects = new Map<string, string>(
  legacyAmpCanonicalPaths.map((destinationPath) => [
    destinationPath === '/' ? '/amp' : `/amp${destinationPath}`,
    destinationPath,
  ]),
);

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

const ADMIN_PATH_PREFIX = '/admin';
const CALLBACK_URL_BASE = 'https://flussdeslebens.live';

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

export function isAdminPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPathname === ADMIN_PATH_PREFIX || normalizedPathname.startsWith(`${ADMIN_PATH_PREFIX}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function normalizeSearch(search: string | null | undefined): string {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search : `?${search}`;
}

function getPathnameFromCallbackUrl(callbackUrl: string): string {
  return callbackUrl.split(/[?#]/, 1)[0] || '/';
}

export function getAuthRedirectPath({
  pathname,
  search,
  requireAdmin = false,
}: {
  pathname: string;
  search?: string | null;
  requireAdmin?: boolean;
}): string {
  const basePath = requireAdmin || isAdminPath(pathname) ? '/admin-login' : '/login';
  const callbackUrl = `${normalizePathname(pathname)}${normalizeSearch(search)}`;

  return callbackUrl === '/'
    ? basePath
    : `${basePath}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
  { allowAdmin = false }: { allowAdmin?: boolean } = {},
): string | null {
  if (!callbackUrl) {
    return null;
  }

  const trimmedCallbackUrl = callbackUrl.trim();

  if (!trimmedCallbackUrl.startsWith('/') || trimmedCallbackUrl.startsWith('//')) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedCallbackUrl, CALLBACK_URL_BASE);

    if (parsedUrl.origin !== CALLBACK_URL_BASE) {
      return null;
    }

    const normalizedPathname = normalizePathname(parsedUrl.pathname);

    if (!allowAdmin && isAdminPath(normalizedPathname)) {
      return null;
    }

    return `${normalizedPathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return null;
  }
}

export function getPostLoginRedirectPath(
  role: string | null | undefined,
  callbackUrl: string | null | undefined,
  { allowAdminCallback = false }: { allowAdminCallback?: boolean } = {},
): string {
  const isAdmin = role === 'ADMIN';

  if (isAdmin) {
    if (!allowAdminCallback) {
      return '/admin';
    }

    const safeAdminCallbackUrl = getSafeCallbackUrl(callbackUrl, { allowAdmin: true });

    if (!safeAdminCallbackUrl) {
      return '/admin';
    }

    const safeAdminCallbackPathname = getPathnameFromCallbackUrl(safeAdminCallbackUrl);
    return isAdminPath(safeAdminCallbackPathname) ? safeAdminCallbackUrl : '/admin';
  }

  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  if (safeCallbackUrl) {
    return safeCallbackUrl;
  }

  return '/dashboard';
}

type CanonicalHostRedirectOptions = {
  requestUrl: string;
  requestHosts: Array<string | null | undefined>;
  canonicalSiteUrl: string;
};

function getObservedHosts(hosts: Array<string | null | undefined>): string[] {
  return [...new Set(hosts.map(normalizeHost).filter(Boolean))];
}

export function getCanonicalHostRedirectDestination({
  requestUrl,
  requestHosts,
  canonicalSiteUrl,
}: CanonicalHostRedirectOptions): string | null {
  try {
    const canonicalUrl = new URL(canonicalSiteUrl);
    const canonicalHost = normalizeHost(canonicalUrl.host);
    const apexHost = getApexHost(canonicalHost);
    const redirectUrl = new URL(requestUrl);
    const observedHosts = getObservedHosts([redirectUrl.host, ...requestHosts]);

    if (!canonicalHost || canonicalHost === apexHost) {
      return null;
    }

    if (observedHosts.includes(canonicalHost) || !observedHosts.includes(apexHost)) {
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
