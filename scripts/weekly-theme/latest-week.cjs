const { getLatestPublishedOrArchivedWeek } = require('./shared.cjs');

try {
  process.stdout.write(
    getLatestPublishedOrArchivedWeek({
      dataPath: process.env.WOCHENTHEMA_DATA_PATH,
    })
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
