import { eq, and } from 'drizzle-orm';
import { addDays, differenceInWeeks, getDay, getDate, getMonth, format } from 'date-fns';
import { db } from '@/lib/db/client';
import { routineInstances, routineSubtasks, routineInstanceSubtasks } from '@/lib/db/schema';
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

function matchesRecurrence(template: RoutineTemplate, date: Date): boolean {
  const dayOfWeek = getDay(date);
  const dayOfMonth = getDate(date);
  const month = getMonth(date);

  switch (template.recurrenceType) {
    case 'weekly': {
      if (!template.recurrenceDaysJson) return false;
      const days: string[] = JSON.parse(template.recurrenceDaysJson);
      return days.some((d) => DAY_MAP[d] === dayOfWeek);
    }

    case 'fortnightly': {
      if (!template.recurrenceAnchorDate || !template.recurrenceDaysJson) return false;
      const anchor = new Date(template.recurrenceAnchorDate + 'T00:00:00');
      const weeksDiff = differenceInWeeks(date, anchor);
      if (weeksDiff % 2 !== 0) return false;
      const days: string[] = JSON.parse(template.recurrenceDaysJson);
      return days.some((d) => DAY_MAP[d] === dayOfWeek);
    }

    case 'monthly': {
      const targetDay = template.recurrenceDaysJson
        ? JSON.parse(template.recurrenceDaysJson)[0]
        : null;
      if (targetDay && typeof targetDay === 'number') {
        return dayOfMonth === targetDay;
      }
      // Fall back to anchor date's day of month
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

/**
 * Generates routine instances for a rolling window from startDate to endDate.
 * Deduplicates via source_generation_key.
 */
export async function generateInstancesForWindow(
  templates: RoutineTemplate[],
  startDate: Date,
  windowDays = 14,
) {
  const activeTemplates = templates.filter((t) => t.isActive && !t.deletedAt);
  let generatedCount = 0;

  for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
    const date = addDays(startDate, dayOffset);
    const dateStr = format(date, 'yyyy-MM-dd');

    for (const template of activeTemplates) {
      if (!matchesRecurrence(template, date)) continue;

      const genKey = `${template.id}_${dateStr}`;

      // Check for existing instance
      const existing = await db
        .select({ id: routineInstances.id })
        .from(routineInstances)
        .where(eq(routineInstances.sourceGenerationKey, genKey))
        .limit(1);

      if (existing.length > 0) continue;

      // Create instance
      const instanceId = generateId();
      const now = new Date().toISOString();

      await db.insert(routineInstances).values({
        id: instanceId,
        routineTemplateId: template.id,
        userId: template.userId,
        instanceDate: dateStr,
        scheduledSession: template.defaultSession,
        effectiveSession: template.defaultSession,
        status: 'pending',
        sourceGenerationKey: genKey,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
        syncVersion: 0,
      });

      // Copy template subtasks to instance
      const templateSubtasks = await db
        .select()
        .from(routineSubtasks)
        .where(eq(routineSubtasks.routineTemplateId, template.id))
        .orderBy(routineSubtasks.sortOrder);

      for (const sub of templateSubtasks) {
        await db.insert(routineInstanceSubtasks).values({
          id: generateId(),
          routineInstanceId: instanceId,
          templateSubtaskId: sub.id,
          title: sub.title,
          isCompleted: false,
          sortOrder: sub.sortOrder ?? 0,
          createdAt: now,
          updatedAt: now,
        });
      }

      generatedCount++;
    }
  }

  return generatedCount;
}
