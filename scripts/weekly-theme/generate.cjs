const { generateWeeklyTheme } = require('./shared.cjs');

function resolveDate(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid WOCHENTHEMA_NOW value: ${value}`);
  }
  return parsed;
}

try {
  const result = generateWeeklyTheme({
    dataPath: process.env.WOCHENTHEMA_DATA_PATH,
    now: resolveDate(process.env.WOCHENTHEMA_NOW),
  });

  if (result.status === 'skipped') {
    console.log(`Wochenthema for ${result.currentWeek} already exists, skipping.`);
    process.exit(0);
  }

  console.log(`Generated Wochenthema for ${result.currentWeek}: ${result.newTheme.title}`);
  if (result.prunedCount > 0) {
    console.log(`Pruned ${result.prunedCount} archived Wochenthema entr${result.prunedCount === 1 ? 'y' : 'ies'}.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
