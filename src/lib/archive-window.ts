export const MS_PER_DAY = 86400000;
export const COMMUNITY_ARCHIVE_DAYS = 90;
export const GENERATED_ARCHIVE_DAYS = 90;
export const WEEKLY_THEME_ARCHIVE_LIMIT = 13;

export function isWithinRecentDays(dateStr: string, days = COMMUNITY_ARCHIVE_DAYS): boolean {
  return Date.now() - new Date(dateStr).getTime() <= days * MS_PER_DAY;
}

export function keepLatestItemsByDate<T extends { date: string }>(
  items: T[],
  limit = GENERATED_ARCHIVE_DAYS,
): T[] {
  return [...items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function keepLatestItemsByWeek<T extends { week: string }>(
  items: T[],
  limit = WEEKLY_THEME_ARCHIVE_LIMIT,
): T[] {
  return [...items]
    .sort((a, b) => b.week.localeCompare(a.week))
    .slice(0, limit);
}

export function keepRecentItemsByCreatedAt<T extends { createdAt: string }>(
  items: T[],
  days = COMMUNITY_ARCHIVE_DAYS,
): T[] {
  return [...items]
    .filter((item) => isWithinRecentDays(item.createdAt, days))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
