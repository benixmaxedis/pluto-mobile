import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/db/query-keys';
import * as routineQueries from '../db/routine-queries';

export function useRoutineInstancesByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.routineInstances.byDate(date),
    queryFn: () => routineQueries.getInstancesByDate(date),
  });
}

export function usePendingRoutineInstances(date: string) {
  return useQuery({
    queryKey: [...queryKeys.routineInstances.byDate(date), 'pending'],
    queryFn: () => routineQueries.getPendingInstancesByDate(date),
  });
}

export function useRoutineInstanceSubtasks(instanceId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.routineInstances.byId(instanceId ?? ''), 'subtasks'],
    queryFn: () => routineQueries.getInstanceSubtasks(instanceId!),
    enabled: !!instanceId,
  });
}
