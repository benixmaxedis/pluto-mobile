import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/db/query-keys';
import * as guideItemQueries from '../db/guide-item-queries';
import type { GuideItemFormData } from '@/lib/validation';

export function useGuideItems() {
  return useQuery({
    queryKey: queryKeys.guideItems.all,
    queryFn: guideItemQueries.getAllGuideItems,
  });
}

export function useGuideItemsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.guideItems.byCategory(category),
    queryFn: () => guideItemQueries.getGuideItemsByCategory(category),
  });
}

export function useCreateGuideItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GuideItemFormData) => guideItemQueries.createGuideItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideItems.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useUpdateGuideItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuideItemFormData> }) =>
      guideItemQueries.updateGuideItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideItems.all });
    },
  });
}

export function useDeleteGuideItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => guideItemQueries.softDeleteGuideItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideItems.all });
    },
  });
}
