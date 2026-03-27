import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/db/query-keys';
import * as actionQueries from '../db/action-queries';
import type { ActionFormData } from '@/lib/validation';

export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActionFormData) => actionQueries.createAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActionFormData> }) =>
      actionQueries.updateAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
    },
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => actionQueries.completeAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useSkipAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => actionQueries.skipAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useSnoozeAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      untilDate,
      untilSession,
    }: {
      id: string;
      untilDate: string;
      untilSession: 'morning' | 'afternoon' | 'evening';
    }) => actionQueries.snoozeAction(id, untilDate, untilSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useMoveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      toDate,
      toSession,
    }: {
      id: string;
      toDate: string;
      toSession: 'morning' | 'afternoon' | 'evening';
    }) => actionQueries.moveAction(id, toDate, toSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => actionQueries.softDeleteAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, title }: { actionId: string; title: string }) =>
      actionQueries.createSubtask(actionId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      actionQueries.toggleSubtask(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
    },
  });
}
