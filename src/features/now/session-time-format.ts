import { format, setHours, setMinutes } from 'date-fns';
import { Session, SESSION_HOURS } from '@/lib/constants';

function atHour(h: number): Date {
  return setMinutes(setHours(new Date(2000, 0, 1), h), 0);
}

export function formatSessionClock(hour: number): string {
  return format(atHour(hour), 'h:mm a');
}

/** "Events from" copy uses session window start → end (end is hour block end). */
export function getSessionWindowLabels(session: Session): { from: string; to: string } {
  const { start, end } = SESSION_HOURS[session];
  return {
    from: formatSessionClock(start),
    to: formatSessionClock(end),
  };
}

export function getFullDayWindowLabels(): { from: string; to: string } {
  const m = SESSION_HOURS[Session.MORNING].start;
  const e = SESSION_HOURS[Session.EVENING].end;
  return { from: formatSessionClock(m), to: formatSessionClock(e) };
}
