'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getMonthOverview } from '@/lib/churchCalendar';

const monthFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

type ChurchCalendarProps = {
  sermonDates?: string[];
};

const weekdayHeadings = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
const weekdayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  timeZone: 'UTC',
});
const selectedDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function toMonthAnchor(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function getMillisecondsUntilNextUtcDay(date: Date): number {
  const nextDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  // Der Mindestwert verhindert einen 0-ms-Timer, falls die Berechnung exakt
  // am Tageswechsel erfolgt und der Timeout sonst sofort erneut angesetzt würde.
  return Math.max(1_000, nextDay.getTime() - date.getTime());
}

function getGridOffset(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

export default function ChurchCalendar({ sermonDates = [] }: ChurchCalendarProps) {
  const [today, setToday] = useState(() => new Date());
  const todayIso = useMemo(() => today.toISOString().slice(0, 10), [today]);
  const [visibleMonth, setVisibleMonth] = useState(() => toMonthAnchor(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const previousTodayIsoRef = useRef(todayIso);
  const sermonDateSet = useMemo(() => new Set(sermonDates), [sermonDates]);

  const monthOverview = useMemo(
    () => getMonthOverview(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1),
    [visibleMonth],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToday(new Date());
    }, getMillisecondsUntilNextUtcDay(today));

    return () => {
      window.clearTimeout(timer);
    };
  }, [today]);

  useEffect(() => {
    const previousTodayIso = previousTodayIsoRef.current;
    if (previousTodayIso === todayIso) return;

    setSelectedDate((current) => (current === previousTodayIso ? todayIso : current));
    setVisibleMonth((current) => {
      const previousMonth = toMonthAnchor(new Date(`${previousTodayIso}T00:00:00Z`));
      const nextMonth = toMonthAnchor(today);

      if (
        current.getUTCFullYear() === previousMonth.getUTCFullYear()
        && current.getUTCMonth() === previousMonth.getUTCMonth()
      ) {
        return nextMonth;
      }

      return current;
    });

    previousTodayIsoRef.current = todayIso;
  }, [today, todayIso]);

  useEffect(() => {
    if (!monthOverview.some((entry) => entry.date === selectedDate)) {
      setSelectedDate(monthOverview[0]?.date ?? selectedDate);
    }
  }, [monthOverview, selectedDate]);

  const selectedDay = monthOverview.find((entry) => entry.date === selectedDate) ?? monthOverview[0] ?? null;
  const calendarCells = useMemo(() => {
    const firstDay = new Date(`${monthOverview[0]?.date ?? todayIso}T00:00:00Z`);
    return [
      ...Array.from({ length: getGridOffset(firstDay) }, (_, index) => ({ type: 'empty' as const, key: `empty-${index}` })),
      ...monthOverview.map((entry) => ({ type: 'day' as const, key: entry.date, entry })),
    ];
  }, [monthOverview, todayIso]);

  return (
    <section className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-blue-100 bg-slate-50 shadow-lg shadow-blue-100/60">
      <div className="border-b border-blue-100 bg-white px-6 py-6 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Kirchenkalender</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            ← Zurück
          </button>
          <h2 className="text-center text-xl font-semibold text-slate-900">
            {monthFormatter.format(visibleMonth)}
          </h2>
          <button
            type="button"
            onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            Weiter →
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {weekdayHeadings.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            if (cell.type === 'empty') {
              return <div key={cell.key} className="aspect-square rounded-2xl bg-transparent" aria-hidden="true" />;
            }

            const { entry } = cell;
            const isSelected = entry.date === selectedDate;
            const hasArchivedSermon = sermonDateSet.has(entry.date);
            const isToday = entry.date === todayIso;

            return (
              <button
                key={entry.date}
                type="button"
                onClick={() => setSelectedDate(entry.date)}
                aria-label={`${entry.date}, ${entry.liturgicalDay}`}
                className={[
                  'relative aspect-square rounded-2xl border p-2 text-left transition',
                  isSelected ? 'border-blue-500 bg-blue-100 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/70',
                  isToday ? 'ring-2 ring-blue-200' : '',
                ].join(' ')}
              >
                <span className="text-sm font-semibold text-slate-900">{entry.day}</span>
                <span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-slate-600">
                  {entry.liturgicalDay}
                </span>
                <span className="absolute bottom-2 right-2 flex items-center gap-1">
                  {entry.isFeastDay ? <span className="text-sm text-amber-600" aria-hidden="true">✦</span> : null}
                  {hasArchivedSermon ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" /> : null}
                </span>
              </button>
            );
          })}
        </div>

        {selectedDay ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Ausgewählter Tag</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {weekdayFormatter.format(new Date(`${selectedDay.date}T00:00:00Z`))}, {selectedDateFormatter.format(new Date(`${selectedDay.date}T00:00:00Z`))}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selectedDay.liturgicalDay}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDay.isFeastDay ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Festtag
                </span>
              ) : null}
              {selectedDay.isSunday ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                  Sonntag
                </span>
              ) : null}
              {sermonDateSet.has(selectedDay.date) ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Predigt im Archiv
                </span>
              ) : null}
            </div>
            {sermonDateSet.has(selectedDay.date) ? (
              <Link
                href={`/archiv/${selectedDay.date}`}
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Predigt dieses Tages öffnen
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
