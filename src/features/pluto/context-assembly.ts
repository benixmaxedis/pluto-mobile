import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows } from '@/lib/supabase/rows';
import { toISODate } from '@/lib/utils/date';
import { getSessionForHour } from '@/lib/constants/sessions';

/**
 * Assemble a concise AI context string from Supabase-backed data.
 */
export async function assembleContext(): Promise<string> {
  const userId = await getCurrentUserId();
  const sb = getSupabase();
  const now = new Date();
  const today = toISODate(now);
  const session = getSessionForHour(now.getHours());

  const { data: actionsToday } = await sb
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .or(`scheduled_date.eq.${today},effective_date.eq.${today}`);

  const todayActions = camelRows((actionsToday ?? []) as Record<string, unknown>[]);

  const { data: routinesToday } = await sb
    .from('routine_instances')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('instance_date', today);

  const todayRoutines = camelRows((routinesToday ?? []) as Record<string, unknown>[]);

  const { data: guideRows } = await sb
    .from('guide_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);

  const activeGuideItems = camelRows((guideRows ?? []) as Record<string, unknown>[]);

  const { data: chainRows } = await sb
    .from('momentum_chains')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('is_active', true);

  const activeChains = camelRows((chainRows ?? []) as Record<string, unknown>[]);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data: eventRows } = await sb
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', yesterday)
    .order('created_at', { ascending: false })
    .limit(20);

  const recentEvents = camelRows((eventRows ?? []) as Record<string, unknown>[]);

  const pendingActions = todayActions.filter((a) => a.status === 'pending');
  const completedActions = todayActions.filter((a) => a.status === 'completed');
  const pendingRoutines = todayRoutines.filter((r) => r.status === 'pending');
  const completedRoutines = todayRoutines.filter((r) => r.status === 'completed');

  const lines: string[] = [];
  lines.push(`Current date: ${today}`);
  lines.push(`Current session: ${session}`);
  lines.push('');
  lines.push("## Today's Queue");
  lines.push(`- ${pendingActions.length} action(s) pending, ${completedActions.length} completed`);
  lines.push(`- ${pendingRoutines.length} routine(s) pending, ${completedRoutines.length} completed`);

  if (pendingActions.length > 0) {
    lines.push('');
    lines.push('Pending actions:');
    for (const a of pendingActions.slice(0, 8)) {
      const prio = a.priority === 'high' ? ' [HIGH]' : '';
      const sess = a.scheduledSession ? ` (${a.scheduledSession})` : '';
      lines.push(`  - ${String(a.title)}${prio}${sess}`);
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
