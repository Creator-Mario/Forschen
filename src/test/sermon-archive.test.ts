import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

  it('keeps only the latest 50 sermons in the shared archive file', async () => {
    const { SERMON_ARCHIVE_LIMIT, getAllSermons, saveSermon } = await import('@/lib/sermonArchive');

    for (let index = 0; index < SERMON_ARCHIVE_LIMIT + 2; index += 1) {
      const current = new Date(Date.UTC(2026, 0, 1));
      current.setUTCDate(current.getUTCDate() + index);
      const date = current.toISOString().slice(0, 10);
      await saveSermon({
        date,
        liturgicalDay: `Tag ${index + 1}`,
        title: `Predigt ${index + 1}`,
        content: `Inhalt ${index + 1}`,
        prayer: `Gebet ${index + 1}`,
        createdAt: `${date}T04:00:00.000Z`,
      });
    }

    const sermons = await getAllSermons();
    expect(sermons).toHaveLength(SERMON_ARCHIVE_LIMIT);
    expect(sermons[0]?.date).toBe('2026-02-21');
    expect(sermons[1]?.date).toBe('2026-02-20');
    expect(sermons.at(-1)?.date).toBe('2026-01-03');

    const storedArchive = JSON.parse(
      readFileSync(path.join(tempDir, 'data', 'sermon-history.json'), 'utf-8'),
    ) as Array<{ date: string }>;
    expect(storedArchive).toHaveLength(SERMON_ARCHIVE_LIMIT);
    expect(storedArchive[0]?.date).toBe('2026-02-21');
    expect(storedArchive.at(-1)?.date).toBe('2026-01-03');
  });

  it('falls back to legacy daily files when the shared archive file is empty', async () => {
    const { getAllSermons, loadSermon } = await import('@/lib/sermonArchive');
    const legacySermon = {
      date: '2026-05-14',
      liturgicalDay: 'Christi Himmelfahrt',
      title: 'Archiv aus Altbestand',
      content: 'Predigttext',
      prayer: 'Gebet',
      createdAt: '2026-05-14T04:00:00.000Z',
    };

    mkdirSync(path.join(tempDir, 'data', 'sermons'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'data', 'sermons', '2026-05-14.json'),
      JSON.stringify(legacySermon, null, 2),
      'utf-8',
    );

    await expect(getAllSermons()).resolves.toEqual([legacySermon]);
    await expect(loadSermon('2026-05-14')).resolves.toEqual(legacySermon);
  });
});
