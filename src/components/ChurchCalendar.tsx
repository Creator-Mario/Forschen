'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getMonthData } from '@/lib/churchCalendarHelpers';
import type { LiturgicalColor } from '@/data/churchCalendarData';

const monthFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

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

const weekdayHeadings = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

const liturgicalColorClasses: Record<LiturgicalColor, string> = {
  weiß: 'bg-slate-200',
  rot: 'bg-rose-500',
  grün: 'bg-emerald-500',
  violett: 'bg-violet-500',
};

type ChurchCalendarProps = {
  sermonDates?: string[];
};

function toMonthAnchor(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function shiftYear(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear() + amount, date.getUTCMonth(), 1));
}

function getMillisecondsUntilNextUtcDay(date: Date): number {
  const nextDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
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

  const monthData = useMemo(
    () => getMonthData(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1),
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
    previousTodayIsoRef.current = todayIso;
  }, [todayIso]);

  useEffect(() => {
    if (!monthData.some((entry) => entry.date === selectedDate)) {
      setSelectedDate(monthData[0]?.date ?? selectedDate);
    }
  }, [monthData, selectedDate]);

  const selectedDay = monthData.find((entry) => entry.date === selectedDate) ?? monthData[0] ?? null;
  const calendarCells = useMemo(() => {
    const firstDay = new Date(`${monthData[0]?.date ?? todayIso}T00:00:00Z`);
    return [
      ...Array.from({ length: getGridOffset(firstDay) }, (_, index) => ({ type: 'empty' as const, key: `empty-${index}` })),
      ...monthData.map((entry) => ({ type: 'day' as const, key: entry.date, entry })),
    ];
  }, [monthData, todayIso]);

  return (
    <section
      aria-label="Kirchenkalender"
      className="w-full overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-lg shadow-blue-100/50"
    >
      <div className="border-b border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Kirchenkalender</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Liturgische Tage im Überblick</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Jeder Tag zeigt Namen, liturgische Farbe und – per Auswahl – die vollständige Bedeutung samt Predigtverknüpfung.
            </p>
          </div>

          <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            {([
              ['weiß', 'Freuden- und Christusfeste'],
              ['rot', 'Geist, Apostel und Märtyrer'],
              ['grün', 'Jahreskreis'],
              ['violett', 'Advent und Fastenzeit'],
            ] as const).map(([color, label]) => (
              <div key={color} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                <span className={`h-2.5 w-2.5 rounded-full ${liturgicalColorClasses[color]}`} aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => shiftYear(current, -1))}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              « Jahr
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              ← Monat
            </button>
            <button
              type="button"
              onClick={() => {
                setVisibleMonth(toMonthAnchor(new Date()));
                setSelectedDate(new Date().toISOString().slice(0, 10));
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Heute
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Monat →
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => shiftYear(current, 1))}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Jahr »
            </button>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Angezeigter Monat</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{monthFormatter.format(visibleMonth)}</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[44rem] space-y-3">
            <div className="grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {weekdayHeadings.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {calendarCells.map((cell) => {
                if (cell.type === 'empty') {
                  return <div key={cell.key} className="min-h-[8.5rem] rounded-3xl bg-transparent" aria-hidden="true" />;
                }

                const { entry } = cell;
                const isSelected = entry.date === selectedDate;
                const isToday = entry.date === todayIso;
                const hasArchivedSermon = sermonDateSet.has(entry.date);

                return (
                  <div key={entry.date} className="relative min-h-[8.5rem]">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(entry.date)}
                      aria-label={`${entry.date}, ${entry.displayName}`}
                      className={[
                        'flex h-full w-full flex-col rounded-3xl border p-3 text-left transition',
                        isSelected ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100/70' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50',
                        isToday ? 'ring-2 ring-blue-300 ring-offset-2 ring-offset-white' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="block text-[1.2rem] font-bold leading-none text-slate-900">{entry.day}</span>
                          <span className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            <span className={`h-2.5 w-2.5 rounded-full ${liturgicalColorClasses[entry.color]}`} aria-hidden="true" />
                            {entry.type}
                          </span>
                        </div>
                        {isToday ? (
                          <span className="rounded-full bg-blue-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                            Heute
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-3 line-clamp-3 text-[0.72rem] leading-4 text-slate-700">
                        {entry.abbreviatedLiturgicalName}
                      </p>
                    </button>

                    {hasArchivedSermon ? (
                      <Link
                        href={`/archiv/${entry.date}`}
                        aria-label={`Predigt im Archiv für ${entry.date}`}
                        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm shadow-sm transition hover:bg-emerald-100"
                        onClick={(event) => event.stopPropagation()}
                      >
                        📖
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDay ? (
          <div className="rounded-[1.75rem] border border-blue-100 bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Ausgewählter liturgischer Tag</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                  {weekdayFormatter.format(new Date(`${selectedDay.date}T00:00:00Z`))}, {selectedDateFormatter.format(new Date(`${selectedDay.date}T00:00:00Z`))}
                </h3>
                <p className="mt-3 text-base font-semibold text-slate-900">{selectedDay.liturgicalName}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{selectedDay.significance}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${liturgicalColorClasses[selectedDay.color]}`} aria-hidden="true" />
                  {selectedDay.color}
                </span>
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-900">
                  {selectedDay.type}
                </span>
                {sermonDateSet.has(selectedDay.date) ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                    Predigt vorhanden
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/kalender/${selectedDay.date}`}
                className="inline-flex min-h-11 items-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
              >
                Liturgischen Tag öffnen
              </Link>
              {sermonDateSet.has(selectedDay.date) ? (
                <Link
                  href={`/archiv/${selectedDay.date}`}
                  className="inline-flex min-h-11 items-center rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Predigt dieses Tages öffnen
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
