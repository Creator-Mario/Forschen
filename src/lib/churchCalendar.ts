import { getDisplayLiturgicalDay, getMonthData, isFeastDay } from '@/lib/churchCalendarHelpers';
import type { ChurchCalendarType, LiturgicalColor } from '@/data/churchCalendarData';

export type MonthOverviewDay = {
  date: string;
  day: number;
  liturgicalDay: string;
  significance: string;
  isSunday: boolean;
  isFeastDay: boolean;
  type: ChurchCalendarType;
  color: LiturgicalColor;
  abbreviatedLiturgicalName: string;
};

export function getMonthOverview(year: number, month: number): MonthOverviewDay[] {
  return getMonthData(year, month).map((entry) => ({
    date: entry.date,
    day: entry.day,
    liturgicalDay: entry.displayName,
    significance: entry.significance,
    isSunday: entry.weekday === 6,
    isFeastDay: isFeastDay(entry.date),
    type: entry.type,
    color: entry.color,
    abbreviatedLiturgicalName: entry.abbreviatedLiturgicalName,
  }));
}

export function getLiturgicalDay(date: Date): string {
  return getDisplayLiturgicalDay(date);
}

export { isFeastDay };
