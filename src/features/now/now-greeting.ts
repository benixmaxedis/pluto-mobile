import { resolveCurrentSession } from '@/features/queue/engine/session-resolver';
import { Session } from '@/lib/constants';

export function getNowGreetingLine(): string {
  const s = resolveCurrentSession(new Date());
  if (s === Session.MORNING) return 'Good morning';
  if (s === Session.AFTERNOON) return 'Good afternoon';
  return 'Good evening';
}
