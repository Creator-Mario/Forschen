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

function toMonthAnchor(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
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
    const timer = window.setInterval(() => {
      setToday(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

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

  return (
    <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-slate-50 shadow-lg shadow-blue-100/60">
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
        <ul className="space-y-3">
          {monthOverview.map((entry) => {
            const isSelected = entry.date === selectedDate;
            const hasArchivedSermon = sermonDateSet.has(entry.date);

            return (
              <li key={entry.date}>
                <button
                  type="button"
                  onClick={() => setSelectedDate(entry.date)}
                  aria-label={`${entry.date}, ${entry.liturgicalDay}`}
                  className={[
                    'flex w-full items-start justify-between rounded-2xl border px-4 py-4 text-left transition',
                    isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/70',
                  ].join(' ')}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{entry.day}. Tag des Monats</p>
                    <p className="mt-1 text-sm text-slate-600">{entry.liturgicalDay}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 pl-4">
                    {entry.isFeastDay ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        Festtag
                      </span>
                    ) : entry.isSunday ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                        Sonntag
                      </span>
                    ) : null}
                    {hasArchivedSermon ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Predigt im Archiv
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {selectedDay ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Ausgewählter Tag</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{selectedDay.date}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selectedDay.liturgicalDay}</p>
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
