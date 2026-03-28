import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as openLoopQueries from '../db/open-loop-queries';
import type { OpenLoopFormData } from '@/lib/validation';

export function useOpenLoops() {
  return useQuery({
    queryKey: queryKeys.openLoops.all,
    queryFn: openLoopQueries.getAllOpenLoops,
  });
}

export function useOpenLoopsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.openLoops.byCategory(category),
    queryFn: () => openLoopQueries.getOpenLoopsByCategory(category),
  });
}

export function useCreateOpenLoop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpenLoopFormData) => openLoopQueries.createOpenLoop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.openLoops.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useConvertOpenLoop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      convertedToType,
      convertedToId,
    }: {
      id: string;
      convertedToType: string;
      convertedToId: string;
    }) => openLoopQueries.convertOpenLoop(id, convertedToType, convertedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.openLoops.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useArchiveOpenLoop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => openLoopQueries.archiveOpenLoop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.openLoops.all });
    },
  });
}
