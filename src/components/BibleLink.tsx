/**
 * BibleLink – wraps detected Bible references in a clickable anchor tag that
 * opens die Deutsche Bibelgesellschaft Online-Bibel (bibleserver.com), a free,
 * paywall-free, login-free Bible service.
 *
 * Recognised formats (German):
 *   Johannes 3,16     Joh 3,16     1. Mose 1,1     Ps 23,1-3
 *   Apostelgeschichte 2,38         Offenbarung 21,1-4
 */

import React from 'react';

// Matches e.g. "Johannes 3,16", "1. Mose 1,1", "Ps 23,1-6", "Röm 8,28-39"
const BIBLE_REF_PATTERN =
  /(\d\.\s*)?[A-ZÄÖÜ][a-zäöüß]+(?:\s[A-ZÄÖÜ][a-zäöüß]+)?\s+\d{1,3},\d{1,3}(?:-\d{1,3})?/g;

function buildBibleUrl(ref: string): string {
  // bibleserver.com format: /LUT/<book>+<chapter>,<verse>
  // We encode the reference as-is which bibleserver handles well
  const encoded = encodeURIComponent(ref.trim());
  return `https://www.bibleserver.com/LUT/${encoded}`;
}

interface BibleLinkProps {
  /** The text content to scan for Bible references */
  text: string;
  className?: string;
}

/**
 * Renders `text` with any embedded Bible references turned into clickable links.
 */
export default function BibleLink({ text, className }: BibleLinkProps) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  BIBLE_REF_PATTERN.lastIndex = 0;

  while ((match = BIBLE_REF_PATTERN.exec(text)) !== null) {
    const [ref] = match;
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      <a
        key={start}
        href={buildBibleUrl(ref)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline decoration-dotted transition-colors"
        title={`Bibelstelle öffnen: ${ref}`}
      >
        {ref}
      </a>
    );

    lastIndex = start + ref.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
