import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/db/query-keys';
import * as routineQueries from '../db/routine-queries';
import { generateInstancesForWindow } from '../db/instance-generation';
import type { RoutineTemplateFormData } from '@/lib/validation';

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoutineTemplateFormData) => routineQueries.createTemplate(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineTemplates.all });
      // Trigger instance generation for new template
      const templates = await routineQueries.getActiveTemplates();
      await generateInstancesForWindow(templates, new Date(), 14);
      queryClient.invalidateQueries({ queryKey: queryKeys.routineInstances.all });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoutineTemplateFormData> }) =>
      routineQueries.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineTemplates.all });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routineQueries.softDeleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineTemplates.all });
    },
  });
}

export function useCompleteInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routineQueries.completeInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineInstances.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useSkipInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routineQueries.skipInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineInstances.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useSnoozeInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      untilSession,
    }: {
      id: string;
      untilSession: 'morning' | 'afternoon' | 'evening';
    }) => routineQueries.snoozeInstance(id, untilSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineInstances.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useMoveInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      toSession,
    }: {
      id: string;
      toSession: 'morning' | 'afternoon' | 'evening';
    }) => routineQueries.moveInstance(id, toSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineInstances.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}
