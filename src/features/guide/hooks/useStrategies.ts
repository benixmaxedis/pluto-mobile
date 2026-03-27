import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/db/query-keys';
import * as strategyQueries from '../db/strategy-queries';
import type { StrategyFormData } from '@/lib/validation';

export function useStrategies() {
  return useQuery({
    queryKey: queryKeys.strategies.all,
    queryFn: strategyQueries.getAllStrategies,
  });
}

export function useStrategiesByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.strategies.byCategory(category),
    queryFn: () => strategyQueries.getStrategiesByCategory(category),
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StrategyFormData) => strategyQueries.createStrategy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StrategyFormData> }) =>
      strategyQueries.updateStrategy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => strategyQueries.softDeleteStrategy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
  });
}
