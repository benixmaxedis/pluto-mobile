import { format, isToday, isTomorrow, isYesterday, startOfDay, parseISO, isValid } from 'date-fns';

/** Normalize stored dates (yyyy-MM-dd or ISO timestamps) for comparisons with todayISO(). */
export function toComparableDate(value: string | null | undefined): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  const d = parseISO(s.length === 10 ? `${s}T12:00:00` : s);
  if (!isValid(d)) return null;
  return format(d, 'yyyy-MM-dd');
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

export function getStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date);
}
