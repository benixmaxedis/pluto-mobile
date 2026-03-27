import { Session, SESSION_HOURS } from './enums';

export const SESSION_ORDER: Session[] = [Session.MORNING, Session.AFTERNOON, Session.EVENING];

export function getSessionForHour(hour: number): Session {
  if (hour >= SESSION_HOURS[Session.EVENING].start) return Session.EVENING;
  if (hour >= SESSION_HOURS[Session.AFTERNOON].start) return Session.AFTERNOON;
  return Session.MORNING;
}

export function getSessionLabel(session: Session): string {
  switch (session) {
    case Session.MORNING:
      return 'Morning';
    case Session.AFTERNOON:
      return 'Afternoon';
    case Session.EVENING:
      return 'Evening';
  }
}
