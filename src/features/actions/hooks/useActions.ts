import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/db/query-keys';
import * as actionQueries from '../db/action-queries';

export function useActions() {
  return useQuery({
    queryKey: queryKeys.actions.all,
    queryFn: actionQueries.getAllActions,
  });
}

export function useActionById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.actions.byId(id ?? ''),
    queryFn: () => actionQueries.getActionById(id!),
    enabled: !!id,
  });
}

export function useActionsByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.actions.byDate(date),
    queryFn: () => actionQueries.getActionsByDate(date),
  });
}

export function useActionSubtasks(actionId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.actions.byId(actionId ?? ''), 'subtasks'],
    queryFn: () => actionQueries.getSubtasksForAction(actionId!),
    enabled: !!actionId,
  });
}
