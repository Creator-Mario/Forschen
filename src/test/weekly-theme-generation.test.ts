import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

const {
  generateWeeklyTheme,
  getLatestPublishedOrArchivedWeek,
  getPublicationWeek,
} = require('../../scripts/weekly-theme/shared.cjs');

interface TestThemeEntry {
  id: string;
  week: string;
  title: string;
  introduction: string;
  bibleVerses: string[];
  problemStatement: string;
  researchQuestions: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

function createPublishedEntry(week: string): TestThemeEntry {
  return {
    id: week,
    week,
    title: `Thema ${week}`,
    introduction: `Einleitung ${week}`,
    bibleVerses: ['Psalm 1'],
    problemStatement: `Frage ${week}`,
    researchQuestions: [`Forschungsfrage ${week}`],
    status: 'published',
    createdAt: `${week}-created`,
  };
}

describe('weekly theme generation scripts', () => {
  let tempDir: string;
  let dataPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'forschen-weekly-theme-'));
    dataPath = path.join(tempDir, 'wochenthema.json');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('generates a new published theme and keeps the archive window stable', () => {
    const existingEntries = Array.from({ length: 13 }, (_, index) =>
      createPublishedEntry(`2026-W${String(index + 1).padStart(2, '0')}`)
    );
    writeFileSync(dataPath, JSON.stringify(existingEntries, null, 2));

    const now = new Date('2026-04-20T12:00:00.000Z');
    const currentWeek = getPublicationWeek(now);
    const result = generateWeeklyTheme({ dataPath, now });
    const savedEntries = JSON.parse(readFileSync(dataPath, 'utf8')) as TestThemeEntry[];

    expect(result.status).toBe('generated');
    expect(result.currentWeek).toBe(currentWeek);
    expect(result.newTheme.week).toBe(currentWeek);
    expect(savedEntries).toHaveLength(13);
    expect(savedEntries.some(entry => entry.week === '2026-W01')).toBe(false);
    expect(savedEntries.at(-1)?.week).toBe(currentWeek);
    expect(getLatestPublishedOrArchivedWeek({ dataPath })).toBe(currentWeek);
  });

  it('skips generation when the current publication week already exists', () => {
    const now = new Date('2026-04-20T12:00:00.000Z');
    const currentWeek = getPublicationWeek(now);
    const existingEntries = [createPublishedEntry(currentWeek)];
    writeFileSync(dataPath, JSON.stringify(existingEntries, null, 2));

    const result = generateWeeklyTheme({ dataPath, now });
    const savedEntries = JSON.parse(readFileSync(dataPath, 'utf8')) as TestThemeEntry[];

    expect(result.status).toBe('skipped');
    expect(result.currentWeek).toBe(currentWeek);
    expect(savedEntries).toEqual(existingEntries);
  });
});
