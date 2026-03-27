import { Session, SESSION_HOURS } from '@/lib/constants';

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
