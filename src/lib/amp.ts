import { canonicalSiteUrl, siteName } from '@/lib/config';

const AMP_BOILERPLATE =
  'body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}';

const AMP_BOILERPLATE_NOSCRIPT =
  'body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}';

const AMP_CUSTOM_STYLES = `
  body { font-family: Georgia, serif; color: #1a202c; margin: 0; padding: 0; background: #f7fafc; }
  header { background: #1565c0; color: #fff; padding: 16px 20px; }
  header a { color: #fbbf24; text-decoration: none; font-weight: bold; font-size: 1.1rem; }
  header p { margin: 4px 0 0; font-size: 0.85rem; color: #bfdbfe; }
  main { max-width: 720px; margin: 0 auto; padding: 24px 20px 40px; }
  h1 { font-size: 1.75rem; color: #1e3a8a; margin: 0 0 8px; }
  h2 { font-size: 1.25rem; color: #1e40af; margin: 24px 0 8px; }
  .meta { font-size: 0.85rem; color: #6b7280; margin-bottom: 20px; }
  .card { background: #fff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .verse { font-size: 1.15rem; font-style: italic; color: #1e3a8a; border-left: 4px solid #2563eb; padding-left: 16px; margin-bottom: 12px; }
  .ref { font-size: 0.9rem; color: #2563eb; font-weight: bold; }
  .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 6px; }
  p { line-height: 1.75; margin: 0 0 12px; }
  ol { padding-left: 20px; }
  ol li { margin-bottom: 10px; line-height: 1.7; color: #374151; }
  .highlight { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
  .highlight p { color: #92400e; margin: 0; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .tag { background: #dbeafe; color: #1e40af; font-size: 0.8rem; padding: 4px 12px; border-radius: 9999px; }
  .cta { background: #1565c0; color: #fff; border-radius: 12px; padding: 20px; text-align: center; margin-top: 32px; }
  .cta p { color: #bfdbfe; margin-bottom: 12px; font-size: 0.95rem; }
  .cta a { display: inline-block; background: #fbbf24; color: #1e3a8a; padding: 10px 24px; border-radius: 9999px; font-weight: bold; text-decoration: none; font-size: 0.95rem; }
  footer { text-align: center; padding: 20px; font-size: 0.8rem; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  footer a { color: #6b7280; }
`;

export interface AmpPageOptions {
  title: string;
  canonicalPath: string;
  description?: string;
  body: string;
}

export function buildAmpPage({ title, canonicalPath, description, body }: AmpPageOptions): string {
  const canonicalUrl = `${canonicalSiteUrl}${canonicalPath}`;
  const fullTitle = `${title} | ${siteName}`;

  return `<!doctype html>
<html ⚡ lang="de">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
  <style amp-boilerplate>${AMP_BOILERPLATE}</style>
  <noscript><style amp-boilerplate>${AMP_BOILERPLATE_NOSCRIPT}</style></noscript>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-custom>${AMP_CUSTOM_STYLES}</style>
</head>
<body>
  <header>
    <a href="${escapeHtml(canonicalSiteUrl)}">${escapeHtml(siteName)}</a>
    <p>Freie christliche Bibelforschung</p>
  </header>
  <main>
    ${body}
  </main>
  <footer>
    <a href="${escapeHtml(canonicalSiteUrl)}">${escapeHtml(siteName)}</a> &middot;
    <a href="${escapeHtml(canonicalSiteUrl)}/impressum">Impressum</a> &middot;
    <a href="${escapeHtml(canonicalSiteUrl)}/datenschutz">Datenschutz</a>
  </footer>
</body>
</html>`;
}

export function ampResponse(html: string): Response {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  });
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
