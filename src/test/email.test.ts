/**
 * Email helper tests
 *
 * Tests for src/lib/email.ts:
 *   - escHtml
 *   - sendEmail (valid address, invalid address, Resend error, network error)
 *   - isDeliverableEmail (via sendEmail behaviour)
 *   - RFC-5322 From header quoting
 *   - sendVerificationEmail, sendPasswordResetEmail
 *
 * Strategy: `vi.mock('resend')` is hoisted to ensure email.ts always gets the
 * mocked constructor. `mockEmailSend` is a module-level vi.fn() that is reset
 * in beforeEach, allowing per-test configuration without module cache issues.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';

// ─── Module-level Resend mock ─────────────────────────────────────────────────
// Must be defined before any import so the hoisted vi.mock can close over it.
const mockEmailSend = vi.fn();

vi.mock('resend', () => ({
  Resend: class MockResend {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emails: { send: (...args: any[]) => any } = { send: mockEmailSend };
  },
}));

vi.mock('@/lib/config', () => ({
  siteName: 'Der Fluss des Lebens',
  siteDomain: 'flussdeslebens.live',
  canonicalSiteUrl: 'https://flussdeslebens.live',
  emailFromAddress: 'kontakt@flussdeslebens.live',
}));

// Set env vars before the module is imported for the first time.
beforeAll(() => {
  process.env.RESEND_API_KEY = 'test-resend-key';
  process.env.NEXTAUTH_URL  = 'https://example.com';
});
afterAll(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.NEXTAUTH_URL;
});

// Import the functions under test AFTER mocks are registered.
import {
  escHtml,
  sendEmail,
  sendAdminApprovalEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWeeklyFaithEmail,
} from '@/lib/email';

// ─── escHtml ─────────────────────────────────────────────────────────────────

describe('escHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes ampersands', () => {
    expect(escHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes single quotes', () => {
    expect(escHtml("it's fine")).toBe("it&#039;s fine");
  });

  it('returns empty string unchanged', () => {
    expect(escHtml('')).toBe('');
  });
});

// ─── sendEmail – address validation ──────────────────────────────────────────

describe('sendEmail – address validation', () => {
  beforeEach(() => mockEmailSend.mockReset());

  it('does NOT call Resend for a soft-deleted placeholder address', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'x' }, error: null });
    const result = await sendEmail({ to: 'deleted-u123@deleted', subject: 'Test', html: '<p>Hi</p>' });
    expect(result).toBe(false);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('does NOT call Resend for an empty address', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'x' }, error: null });
    const result = await sendEmail({ to: '', subject: 'Test', html: '<p>Hi</p>' });
    expect(result).toBe(false);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('does NOT call Resend for address without valid TLD', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'x' }, error: null });
    const result = await sendEmail({ to: 'user@nodot', subject: 'Test', html: '<p>Hi</p>' });
    expect(result).toBe(false);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('does NOT call Resend for address without @', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'x' }, error: null });
    const result = await sendEmail({ to: 'invalidemail', subject: 'Test', html: '<p>Hi</p>' });
    expect(result).toBe(false);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('calls Resend for a valid email address and returns true', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'resend-id-1' }, error: null });
    const result = await sendEmail({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' });
    expect(result).toBe(true);
    expect(mockEmailSend).toHaveBeenCalledOnce();
  });

  it('uses double-quoted display name in From header (RFC 5322)', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'x' }, error: null });
    await sendEmail({ to: 'user@example.com', subject: 'S', html: '<p>H</p>' });
    const callArgs = mockEmailSend.mock.calls[0][0] as { from: string };
    // Must be: "Display Name" <addr@domain>
    expect(callArgs.from).toMatch(/^"[^"]+" <[^>]+>$/);
    expect(callArgs.from).toContain('kontakt@flussdeslebens.live');
  });

  it('returns false and does not throw when Resend returns a validation error', async () => {
    mockEmailSend.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'Invalid address', statusCode: 422 } });
    const result = await sendEmail({ to: 'user@example.com', subject: 'S', html: '<p>H</p>' });
    expect(result).toBe(false);
  });
});

// ─── sendVerificationEmail ────────────────────────────────────────────────────

describe('sendVerificationEmail', () => {
  beforeEach(() => mockEmailSend.mockReset());

  it('returns true when Resend succeeds', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'id-1' }, error: null });
    const result = await sendVerificationEmail('alice@example.com', 'abc123token');
    expect(result).toBe(true);
  });

  it('uses the live domain for verification links and ignores mismatching NEXTAUTH_URL', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'id-2' }, error: null });
    await sendVerificationEmail('alice@example.com', 'mytoken42');
    const callArgs = mockEmailSend.mock.calls[0][0] as { html: string; text: string };
    expect(callArgs.html).toContain('mytoken42');
    expect(callArgs.html).toContain('/api/auth/verify-email');
    expect(callArgs.html).toContain('https://flussdeslebens.live/api/auth/verify-email?token=mytoken42');
    expect(callArgs.html).not.toContain('https://example.com');
    expect(callArgs.text).toContain('mytoken42');
  });

  it('returns false when Resend returns a validation error', async () => {
    mockEmailSend.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'bad address', statusCode: 422 } });
    const result = await sendVerificationEmail('alice@example.com', 'token');
    expect(result).toBe(false);
  });
});

// ─── sendPasswordResetEmail ───────────────────────────────────────────────────

describe('sendPasswordResetEmail', () => {
  beforeEach(() => mockEmailSend.mockReset());

  it('returns true on success and uses the live domain in reset links', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'pr-1' }, error: null });
    const result = await sendPasswordResetEmail('alice@example.com', 'Alice', 'reset-token-xyz');
    expect(result).toBe(true);
    const callArgs = mockEmailSend.mock.calls[0][0] as { html: string; text: string };
    expect(callArgs.html).toContain('reset-token-xyz');
    expect(callArgs.html).toContain('/passwort-zuruecksetzen');
    expect(callArgs.html).toContain('https://flussdeslebens.live/passwort-zuruecksetzen?token=reset-token-xyz');
    expect(callArgs.html).not.toContain('https://example.com');
    expect(callArgs.text).toContain('reset-token-xyz');
  });

  it('returns false when Resend returns a rate-limit error', async () => {
    mockEmailSend.mockResolvedValue({ data: null, error: { name: 'rate_limit_exceeded', message: 'Rate limited', statusCode: 429 } });
    const result = await sendPasswordResetEmail('alice@example.com', 'Alice', 'token');
    expect(result).toBe(false);
  });
});

describe('sendAdminApprovalEmail', () => {
  beforeEach(() => mockEmailSend.mockReset());

  it('uses the canonical login URL in the approval email', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'ap-1' }, error: null });
    const result = await sendAdminApprovalEmail('alice@example.com', 'Alice', true, 'Willkommen!');
    expect(result).toBe(true);
    expect(mockEmailSend).toHaveBeenCalledOnce();
    const callArgs = mockEmailSend.mock.calls[0][0] as { html: string; text: string };
    expect(callArgs.html).toContain('https://flussdeslebens.live/login');
    expect(callArgs.text).toContain('https://flussdeslebens.live/login');
    expect(callArgs.html).not.toContain('https://example.com/login');
  });
});

describe('sendWeeklyFaithEmail', () => {
  beforeEach(() => mockEmailSend.mockReset());

  it('sends a personalized weekly faith email with topic, story and blessing', async () => {
    mockEmailSend.mockResolvedValue({ data: { id: 'wf-1' }, error: null });
    const result = await sendWeeklyFaithEmail('alice@example.com', 'Alice', {
      id: '2026-W15',
      week: '2026-W15',
      title: 'Die Nachfolge',
      introduction: 'Jesus ruft in die Nachfolge.',
      bibleVerses: ['Markus 1,16-20'],
      problemStatement: 'Was bedeutet Nachfolge heute?',
      researchQuestions: ['Welchen Schritt des Vertrauens möchte ich gehen?'],
      status: 'published',
    });
    expect(result).toBe(true);
    const callArgs = mockEmailSend.mock.calls[0][0] as { html: string; text: string; subject: string };
    expect(callArgs.subject).toContain('Die Nachfolge');
    expect(callArgs.html).toContain('Hallo Alice');
    expect(callArgs.html).toContain('Biblische Geschichte');
    expect(callArgs.html).toContain('Segenswunsch');
    expect(callArgs.text).toContain('Welchen Schritt des Vertrauens möchte ich gehen?');
  });
});
