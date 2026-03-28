import { Session, SESSION_HOURS } from '@/lib/constants';
import { toISODate } from '@/lib/utils/date';

export function resolveCurrentSession(now: Date = new Date()): Session {
  const hour = now.getHours();

  if (hour >= SESSION_HOURS[Session.EVENING].start) return Session.EVENING;
  if (hour >= SESSION_HOURS[Session.AFTERNOON].start) return Session.AFTERNOON;
  return Session.MORNING;
}

export function isSessionPast(session: Session, currentSession: Session): boolean {
  const order: Record<Session, number> = {
    [Session.MORNING]: 0,
    [Session.AFTERNOON]: 1,
    [Session.EVENING]: 2,
  };
  return order[session] < order[currentSession];
}

/** True when this calendar date + session window is over relative to `now` (not the live "Today" tab). */
export function isNowSessionPast(date: string, session: Session, now: Date = new Date()): boolean {
  const today = toISODate(now);
  if (date < today) return true;
  if (date > today) return false;
  return isSessionPast(session, resolveCurrentSession(now));
}
