import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as routineQueries from '../db/routine-queries';
import { generateInstancesForWindow } from '../db/instance-generation';
import type { RoutineTemplateFormData } from '@/lib/validation';
import type { RoutineTemplate } from '../types';

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoutineTemplateFormData) => routineQueries.createTemplate(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routineTemplates.all });
      try {
        const templates = (await routineQueries.getActiveTemplates()) as RoutineTemplate[];
        await generateInstancesForWindow(templates, new Date(), 14);
      } catch (e) {
        console.error('Failed to generate routine instances after create', e);
      }
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
