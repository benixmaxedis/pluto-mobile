import { eq, and, gte, isNull, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  actions,
  routineInstances,
  guideItems,
  activityEvents,
  momentumChains,
} from '@/lib/db/schema';
import { toISODate } from '@/lib/utils/date';
import { getSessionForHour } from '@/lib/constants/sessions';

/**
 * Assemble a concise AI context string from local data.
 * Includes: today's queue summary, recent activity (last 24 h),
 * active guide-items count, and current session.
 * Kept under ~500 words so it fits comfortably in a system prompt.
 */
export async function assembleContext(): Promise<string> {
  const now = new Date();
  const today = toISODate(now);
  const session = getSessionForHour(now.getHours());

  // ── Today's actions ─────────────────────────────────────
  const todayActions = await db
    .select()
    .from(actions)
    .where(
      and(
        eq(actions.scheduledDate, today),
        isNull(actions.deletedAt),
      ),
    );

  const pendingActions = todayActions.filter((a) => a.status === 'pending');
  const completedActions = todayActions.filter((a) => a.status === 'completed');

  // ── Today's routine instances ───────────────────────────
  const todayRoutines = await db
    .select()
    .from(routineInstances)
    .where(
      and(
        eq(routineInstances.instanceDate, today),
        isNull(routineInstances.deletedAt),
      ),
    );

  const pendingRoutines = todayRoutines.filter((r) => r.status === 'pending');
  const completedRoutines = todayRoutines.filter((r) => r.status === 'completed');

  // ── Active guide items count ────────────────────────────
  const activeGuideItems = await db
    .select()
    .from(guideItems)
    .where(isNull(guideItems.deletedAt));

  // ── Active momentum chains ─────────────────────────────
  const activeChains = await db
    .select()
    .from(momentumChains)
    .where(
      and(
        eq(momentumChains.isActive, true),
        isNull(momentumChains.deletedAt),
      ),
    );

  // ── Recent activity (last 24 h) ────────────────────────
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentEvents = await db
    .select()
    .from(activityEvents)
    .where(gte(activityEvents.createdAt, yesterday.toISOString()))
    .orderBy(desc(activityEvents.createdAt))
    .limit(20);

  // ── Build context string ────────────────────────────────
  const lines: string[] = [];

  lines.push(`Current date: ${today}`);
  lines.push(`Current session: ${session}`);
  lines.push('');

  lines.push('## Today\'s Queue');
  lines.push(`- ${pendingActions.length} action(s) pending, ${completedActions.length} completed`);
  lines.push(`- ${pendingRoutines.length} routine(s) pending, ${completedRoutines.length} completed`);

  if (pendingActions.length > 0) {
    lines.push('');
    lines.push('Pending actions:');
    for (const a of pendingActions.slice(0, 8)) {
      const prio = a.priority === 'high' ? ' [HIGH]' : '';
      const sess = a.scheduledSession ? ` (${a.scheduledSession})` : '';
      lines.push(`  - ${a.title}${prio}${sess}`);
    }
    if (pendingActions.length > 8) {
      lines.push(`  ... and ${pendingActions.length - 8} more`);
    }
  }

  lines.push('');
  lines.push('## Guide & Chains');
  lines.push(`- ${activeGuideItems.length} guide item(s) defined`);
  lines.push(`- ${activeChains.length} active momentum chain(s)`);

  if (recentEvents.length > 0) {
    lines.push('');
    lines.push('## Recent Activity (last 24 h)');
    for (const evt of recentEvents.slice(0, 10)) {
      lines.push(`  - ${evt.eventType} on ${evt.entityType} (${evt.createdAt})`);
    }
    if (recentEvents.length > 10) {
      lines.push(`  ... and ${recentEvents.length - 10} more events`);
    }
  }

  return lines.join('\n');
}
