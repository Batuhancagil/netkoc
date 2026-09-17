export const WEEKDAYS_TR = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

// Returns start-of-week (00:00) for a given date according to org.weekStartsOn
// (0=Sun, 1=Mon, ..., 6=Sat). Default = 1 (Mon).
export function startOfWeek(date: Date, weekStartsOn = 1): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(date: Date, weekStartsOn = 1): Date {
  const s = startOfWeek(date, weekStartsOn);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysOfWeek(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDate(value: string): Date {
  return new Date(value);
}

export function formatWeekLabel(weekStart: Date, weekEnd: Date): string {
  const fmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" });
  return `${fmt.format(weekStart)} - ${fmt.format(weekEnd)}`;
}

export function weekDayLabel(date: Date): string {
  return WEEKDAYS_TR[(date.getDay() + 6) % 7];
}

/** Eylül=0 … Mayıs=8. Yaz aylarında -1. */
export function academicMonthIndex(date: Date): number {
  const m = date.getUTCMonth();
  if (m >= 8) return m - 8;
  if (m <= 4) return m + 4;
  return -1;
}

export function academicWeekIndex(date: Date): number {
  return Math.min(4, Math.floor((date.getUTCDate() - 1) / 7));
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function shiftUtcYears(date: Date, years: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate(), 12, 0, 0)
  );
}

/** Yol haritası haftasının takvimini bu akademik yıla taşır (2025-26 şablon → 2026-27). */
export function planDatesForRoadmapWeek(week: { startDate: Date; endDate: Date }, now = new Date()) {
  const targetStartYear = now.getUTCMonth() >= 8 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const srcStartYear =
    week.startDate.getUTCMonth() >= 8
      ? week.startDate.getUTCFullYear()
      : week.startDate.getUTCFullYear() - 1;
  const delta = targetStartYear - srcStartYear;
  const weekStart = startOfUtcDay(shiftUtcYears(week.startDate, delta));
  const weekEnd = startOfUtcDay(shiftUtcYears(week.endDate, delta));
  weekEnd.setUTCHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

export function findRoadmapWeek<
  T extends { startDate: Date; endDate: Date; monthIndex?: number; weekIndex?: number },
>(weeks: T[], date: Date): T | null {
  const t = date.getTime();
  for (const w of weeks) {
    if (w.startDate.getTime() <= t && t <= w.endDate.getTime()) return w;
  }
  const mi = academicMonthIndex(date);
  const wi = academicWeekIndex(date);
  if (mi < 0) return null;
  return (
    weeks.find((w) => w.monthIndex === mi && w.weekIndex === wi) ??
    weeks.find((w) => w.monthIndex === mi) ??
    null
  );
}
