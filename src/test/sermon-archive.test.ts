import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalCwd = process.cwd();

describe('sermonArchive helpers', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'forschen-sermon-archive-'));
    process.chdir(tempDir);
    vi.resetModules();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('saves and loads a sermon in the dated archive file', async () => {
    const { loadSermon, saveSermon } = await import('@/lib/sermonArchive');
    const sermon = {
      date: '2026-05-14',
      liturgicalDay: 'Christi Himmelfahrt',
      title: 'Aufgefahren, aber nicht fort',
      content: 'Predigttext',
      prayer: 'Gebet',
      createdAt: '2026-05-14T04:00:00.000Z',
    };

    await saveSermon(sermon);

    await expect(loadSermon('2026-05-14')).resolves.toEqual(sermon);
  });

  it('returns sermons sorted descending and limits the latest list', async () => {
    const { getAllSermons, getLatestSermons, saveSermon } = await import('@/lib/sermonArchive');

    await saveSermon({
      date: '2026-05-13',
      liturgicalDay: 'Mittwoch',
      title: 'Predigt vom Mittwoch',
      content: 'A',
      prayer: 'B',
      createdAt: '2026-05-13T04:00:00.000Z',
    });
    await saveSermon({
      date: '2026-05-14',
      liturgicalDay: 'Christi Himmelfahrt',
      title: 'Predigt vom Donnerstag',
      content: 'C',
      prayer: 'D',
      createdAt: '2026-05-14T04:00:00.000Z',
    });

    await expect(getAllSermons()).resolves.toMatchObject([
      { date: '2026-05-14' },
      { date: '2026-05-13' },
    ]);
    await expect(getLatestSermons(1)).resolves.toMatchObject([
      { date: '2026-05-14' },
    ]);
  });

  it('detects similar sermon titles', async () => {
    const { saveSermon, titleExists } = await import('@/lib/sermonArchive');

    await saveSermon({
      date: '2026-05-14',
      liturgicalDay: 'Christi Himmelfahrt',
      title: 'Die Hoffnung trägt uns weiter',
      content: 'Predigttext',
      prayer: 'Gebet',
      createdAt: '2026-05-14T04:00:00.000Z',
    });

    await expect(titleExists('Die Hoffnung trägt uns')).resolves.toBe(true);
    await expect(titleExists('Ein neuer Morgen des Glaubens')).resolves.toBe(false);
  });
});
