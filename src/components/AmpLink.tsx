import { canonicalSiteUrl } from '@/lib/config';

interface AmpLinkProps {
  path: string;
}

/**
 * Renders <link rel="amphtml"> in the document head.
 * In Next.js App Router, <link> tags from Server Components are automatically
 * hoisted into the <head> of the HTML document.
 */
export default function AmpLink({ path }: AmpLinkProps) {
  return (
    // eslint-disable-next-line @next/next/no-head-element
    <link rel="amphtml" href={`${canonicalSiteUrl}/amp${path}`} />
  );
}
