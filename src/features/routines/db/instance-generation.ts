import { addDays, differenceInWeeks, getDay, getDate, getMonth, format } from 'date-fns';
import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import type { RoutineTemplate } from '../types';

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const FORM_DAY_TO_GET_DAY: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 0,
};

function dayMatchesStoredValue(dayOfWeek: number, raw: unknown): boolean {
  if (typeof raw === 'number' && raw >= 1 && raw <= 7) {
    return FORM_DAY_TO_GET_DAY[raw] === dayOfWeek;
  }
  if (typeof raw === 'string') {
    return DAY_MAP[raw.toLowerCase()] === dayOfWeek;
  }
  return false;
}

function matchesRecurrence(template: RoutineTemplate, date: Date): boolean {
  const dayOfWeek = getDay(date);
  const dayOfMonth = getDate(date);
  const month = getMonth(date);

  switch (template.recurrenceType) {
    case 'weekly': {
      if (!template.recurrenceDaysJson) return false;
      const days: unknown[] = JSON.parse(template.recurrenceDaysJson);
      return days.some((d) => dayMatchesStoredValue(dayOfWeek, d));
    }

    case 'fortnightly': {
      if (!template.recurrenceAnchorDate || !template.recurrenceDaysJson) return false;
      const anchor = new Date(template.recurrenceAnchorDate + 'T00:00:00');
      const weeksDiff = differenceInWeeks(date, anchor);
      if (weeksDiff % 2 !== 0) return false;
      const days: unknown[] = JSON.parse(template.recurrenceDaysJson);
      return days.some((d) => dayMatchesStoredValue(dayOfWeek, d));
    }

    case 'monthly': {
      const targetDay = template.recurrenceDaysJson
        ? JSON.parse(template.recurrenceDaysJson)[0]
        : null;
      if (targetDay && typeof targetDay === 'number') {
        return dayOfMonth === targetDay;
      }
      if (template.recurrenceAnchorDate) {
        const anchorDay = getDate(new Date(template.recurrenceAnchorDate + 'T00:00:00'));
        return dayOfMonth === anchorDay;
      }
      return false;
    }

    case 'quarterly': {
      if (!template.recurrenceAnchorDate) return false;
      const anchor = new Date(template.recurrenceAnchorDate + 'T00:00:00');
      const anchorMonth = getMonth(anchor);
      const anchorDay = getDate(anchor);
      if (dayOfMonth !== anchorDay) return false;
      return (month - anchorMonth + 12) % 3 === 0;
    }

    case 'annually': {
      if (!template.recurrenceAnchorDate) return false;
      const anchor = new Date(template.recurrenceAnchorDate + 'T00:00:00');
      return month === getMonth(anchor) && dayOfMonth === getDate(anchor);
    }

    default:
      return false;
  }
}

export async function generateInstancesForWindow(
  templates: RoutineTemplate[],
  startDate: Date,
  windowDays = 14,
) {
  const activeTemplates = templates.filter((t) => t.isActive && !t.deletedAt);
  let generatedCount = 0;
  const sb = getSupabase();

  for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
    const date = addDays(startDate, dayOffset);
    const dateStr = format(date, 'yyyy-MM-dd');

    for (const template of activeTemplates) {
      if (!matchesRecurrence(template, date)) continue;

      const genKey = `${template.id}_${dateStr}`;

      const { data: existing } = await sb
        .from('routine_instances')
        .select('id')
        .eq('source_generation_key', genKey)
        .maybeSingle();

      if (existing) continue;

      const instanceId = generateId();
      const now = new Date().toISOString();
      const userId = (template.userId as string) ?? (await getCurrentUserId());

      const instRow = snakeKeys({
        id: instanceId,
        routineTemplateId: template.id,
        userId,
        instanceDate: dateStr,
        scheduledSession: template.defaultSession,
        effectiveSession: template.defaultSession,
        status: 'pending',
        sourceGenerationKey: genKey,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'synced',
        syncVersion: 0,
      });

      const { error: insErr } = await sb.from('routine_instances').insert(instRow);
      if (insErr) throw insErr;

      const { data: subRows, error: subErr } = await sb
        .from('routine_subtasks')
        .select('*')
        .eq('routine_template_id', template.id)
        .order('sort_order', { ascending: true });
      if (subErr) throw subErr;

      const templateSubtasks = camelRows((subRows ?? []) as Record<string, unknown>[]);

      for (const sub of templateSubtasks) {
        const stRow = snakeKeys({
          id: generateId(),
          routineInstanceId: instanceId,
          templateSubtaskId: sub.id,
          title: sub.title,
          isCompleted: false,
          sortOrder: sub.sortOrder ?? 0,
          createdAt: now,
          updatedAt: now,
        });
        const { error: stErr } = await sb.from('routine_instance_subtasks').insert(stRow);
        if (stErr) throw stErr;
      }

      generatedCount++;
    }
  }

  return generatedCount;
}
