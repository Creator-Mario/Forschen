import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatDate,
  formatDateShort,
  getISOWeek,
  sanitizeText,
  truncate,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });

  it('contains a timestamp portion and a random portion', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('formatDate', () => {
  it('formats an ISO date string in German long format', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('returns a non-empty string for a valid date', () => {
    expect(formatDate('2023-01-01').length).toBeGreaterThan(0);
  });

  it('handles year-end date', () => {
    const result = formatDate('2023-12-31');
    expect(result).toContain('2023');
  });
});

describe('formatDateShort', () => {
  it('formats as DD.MM.YYYY for German locale', () => {
    const result = formatDateShort('2024-06-20');
    // German locale formats as 20.6.2024 or 20.06.2024
    expect(result).toContain('2024');
    expect(result).toContain('20');
    expect(result).toContain('6');
  });

  it('returns a string', () => {
    expect(typeof formatDateShort('2024-01-01')).toBe('string');
  });
});

describe('getISOWeek', () => {
  it('returns a string matching YYYY-Www format', () => {
    const result = getISOWeek(new Date('2024-01-08'));
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('returns week 01 for the first ISO week of 2024', () => {
    // 2024-01-01 is in week 1
    const result = getISOWeek(new Date('2024-01-01'));
    expect(result).toMatch(/^2024-W01$/);
  });

  it('handles year boundary (Dec 31 can belong to next year)', () => {
    // 2018-12-31 belongs to ISO week 2019-W01
    const result = getISOWeek(new Date('2018-12-31'));
    expect(result).toBe('2019-W01');
  });

  it('uses current date when no argument provided', () => {
    const result = getISOWeek();
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('pads week number with leading zero', () => {
    // Week 1
    const result = getISOWeek(new Date('2024-01-01'));
    expect(result).toBe('2024-W01');
  });
});

describe('sanitizeText', () => {
  it('removes HTML tags', () => {
    expect(sanitizeText('<b>Hello</b>')).toBe('Hello');
  });

  it('removes nested/complex HTML', () => {
    expect(sanitizeText('<div class="x"><p>test</p></div>')).toBe('test');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('leaves plain text unchanged', () => {
    expect(sanitizeText('plain text')).toBe('plain text');
  });

  it('strips script tags but keeps inner text (tag-only removal)', () => {
    // sanitizeText removes HTML tag syntax only; inner text content is preserved
    expect(sanitizeText('<script>alert(1)</script>xss')).toBe('alert(1)xss');
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});

describe('truncate', () => {
  it('returns the original text when shorter than length', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('returns the original text when equal to length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends ellipsis when longer than length', () => {
    const result = truncate('Hello World', 5);
    expect(result).toBe('Hello…');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('handles length of 0', () => {
    expect(truncate('abc', 0)).toBe('…');
  });
});

describe('getStatusLabel', () => {
  it('returns German label for known statuses', () => {
    expect(getStatusLabel('pending')).toBe('Ausstehend');
    expect(getStatusLabel('created')).toBe('Eingereicht');
    expect(getStatusLabel('review')).toBe('In Prüfung');
    expect(getStatusLabel('approved')).toBe('Genehmigt');
    expect(getStatusLabel('published')).toBe('Veröffentlicht');
    expect(getStatusLabel('question_to_user')).toBe('Rückfrage');
    expect(getStatusLabel('postponed')).toBe('Zurückgestellt');
    expect(getStatusLabel('deleted')).toBe('Gelöscht');
    expect(getStatusLabel('rejected')).toBe('Abgelehnt');
    expect(getStatusLabel('draft')).toBe('Entwurf');
    expect(getStatusLabel('archived')).toBe('Archiviert');
  });

  it('returns the raw status string for unknown values', () => {
    expect(getStatusLabel('unknown_status')).toBe('unknown_status');
    expect(getStatusLabel('')).toBe('');
  });
});

describe('getStatusColor', () => {
  it('returns a Tailwind CSS class string for known statuses', () => {
    expect(getStatusColor('approved')).toBe('bg-green-100 text-green-800');
    expect(getStatusColor('published')).toBe('bg-green-100 text-green-800');
    expect(getStatusColor('review')).toBe('bg-blue-100 text-blue-800');
    expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
    expect(getStatusColor('created')).toBe('bg-yellow-100 text-yellow-800');
    expect(getStatusColor('question_to_user')).toBe('bg-orange-100 text-orange-800');
    expect(getStatusColor('postponed')).toBe('bg-slate-100 text-slate-800');
    expect(getStatusColor('deleted')).toBe('bg-red-100 text-red-800');
    expect(getStatusColor('rejected')).toBe('bg-red-100 text-red-800');
    expect(getStatusColor('draft')).toBe('bg-gray-100 text-gray-800');
    expect(getStatusColor('archived')).toBe('bg-slate-100 text-slate-800');
  });

  it('falls back to gray for unknown status', () => {
    expect(getStatusColor('nonexistent')).toBe('bg-gray-100 text-gray-800');
  });
});
