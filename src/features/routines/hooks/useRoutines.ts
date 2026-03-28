import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as routineQueries from '../db/routine-queries';

export function useRoutineTemplates() {
  return useQuery({
    queryKey: queryKeys.routineTemplates.all,
    queryFn: routineQueries.getAllTemplates,
  });
}

export function useRoutineTemplateById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.routineTemplates.byId(id ?? ''),
    queryFn: () => routineQueries.getTemplateById(id!),
    enabled: !!id,
  });
}

export function useRoutineTemplatesByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.routineTemplates.byCategory(category),
    queryFn: () => routineQueries.getTemplatesByCategory(category),
  });
}

export function useRoutineTemplateSubtasks(templateId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.routineTemplates.byId(templateId ?? ''), 'subtasks'],
    queryFn: () => routineQueries.getTemplateSubtasks(templateId!),
    enabled: !!templateId,
  });
}
