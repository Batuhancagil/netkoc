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

// Determine which roadmap week covers a given date
export function findRoadmapWeek<T extends { startDate: Date; endDate: Date }>(
  weeks: T[],
  date: Date
): T | null {
  const t = date.getTime();
  for (const w of weeks) {
    if (w.startDate.getTime() <= t && t <= w.endDate.getTime()) return w;
  }
  return null;
}
