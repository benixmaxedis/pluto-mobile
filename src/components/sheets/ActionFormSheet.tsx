import { forwardRef, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionSchema, type ActionFormData } from '@/lib/validation';
import { useCreateAction, useUpdateAction } from '@/features/actions/hooks/useActionMutations';
import { useActionSubtasks } from '@/features/actions/hooks/useActions';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as actionQueries from '@/features/actions/db/action-queries';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, Chip } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize } from '@/lib/theme';
import { todayISO, toISODate } from '@/lib/utils/date';
import { addDays } from 'date-fns';

type ActionFormValues = {
  title: string;
  notes?: string;
  scheduledDate?: string;
  scheduledSession?: 'morning' | 'afternoon' | 'evening';
  priority: 'normal' | 'high';
  isHeld: boolean;
};

type LocalSubtask = { id?: string; title: string };

const SESSIONS = ['morning', 'afternoon', 'evening'] as const;
const PRIORITIES = ['normal', 'high'] as const;

const DATE_OPTIONS = [
  { label: 'Today', value: () => todayISO() },
  { label: 'Tomorrow', value: () => toISODate(addDays(new Date(), 1)) },
  { label: 'No Date', value: () => undefined },
] as const;

interface ActionFormSheetProps {
  editId?: string | null;
  editData?: Partial<ActionFormData> | null;
  onDismiss?: () => void;
}

export const ActionFormSheet = forwardRef<FormSheetRef, ActionFormSheetProps>(
  ({ editId, editData, onDismiss }, ref) => {
    const createAction = useCreateAction();
    const updateAction = useUpdateAction();
    const queryClient = useQueryClient();
    const isEdit = !!editId;

    const [subtasks, setSubtasks] = useState<LocalSubtask[]>([]);
    const [removedIds, setRemovedIds] = useState<string[]>([]);

    const { data: existingSubtasks } = useActionSubtasks(editId ?? null);

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm<ActionFormValues>({
      resolver: zodResolver(ActionSchema) as any,
      defaultValues: {
        title: '',
        notes: '',
        scheduledDate: todayISO(),
        scheduledSession: undefined,
        priority: 'normal',
        isHeld: false,
      },
    });

    useEffect(() => {
      if (editData) {
        reset({
          title: editData.title ?? '',
          notes: editData.notes ?? '',
          scheduledDate: editData.scheduledDate ?? undefined,
          scheduledSession: editData.scheduledSession ?? undefined,
          priority: editData.priority ?? 'normal',
          isHeld: editData.isHeld ?? false,
        });
      } else {
        reset({
          title: '',
          notes: '',
          scheduledDate: todayISO(),
          scheduledSession: undefined,
          priority: 'normal',
          isHeld: false,
        });
      }
      setRemovedIds([]);
    }, [editData, reset]);

    useEffect(() => {
      if (existingSubtasks) {
        setSubtasks(
          (existingSubtasks as Array<{ id: string; title: string }>).map((st) => ({
            id: st.id,
            title: st.title,
          })),
        );
      } else if (!editId) {
        setSubtasks([]);
      }
    }, [existingSubtasks, editId]);

    const addSubtask = useCallback(() => {
      setSubtasks((prev) => [...prev, { title: '' }]);
    }, []);

    const updateSubtaskTitle = useCallback((index: number, title: string) => {
      setSubtasks((prev) => prev.map((st, i) => (i === index ? { ...st, title } : st)));
    }, []);

    const removeSubtask = useCallback((index: number) => {
      setSubtasks((prev) => {
        const st = prev[index];
        if (st.id) {
          setRemovedIds((ids) => [...ids, st.id!]);
        }
        return prev.filter((_, i) => i !== index);
      });
    }, []);

    const scheduledDate = watch('scheduledDate');
    const scheduledSession = watch('scheduledSession');
    const priority = watch('priority');
    const isHeld = watch('isHeld');

    const onSubmit: SubmitHandler<ActionFormValues> = useCallback(
      async (data) => {
        const nonEmptySubtasks = subtasks.filter((st) => st.title.trim());

        if (isEdit && editId) {
          await updateAction.mutateAsync({ id: editId, data });

          await Promise.all(removedIds.map((id) => actionQueries.deleteSubtask(id)));

          for (const st of nonEmptySubtasks) {
            if (!st.id) {
              await actionQueries.createSubtask(editId, st.title.trim());
            }
          }

          queryClient.invalidateQueries({
            queryKey: [...queryKeys.actions.byId(editId), 'subtasks'],
          });
        } else {
          const newId = await createAction.mutateAsync(data);

          for (const st of nonEmptySubtasks) {
            await actionQueries.createSubtask(newId, st.title.trim());
          }

          queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
        }

        reset();
        setSubtasks([]);
        setRemovedIds([]);
        (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
        onDismiss?.();
      },
      [isEdit, editId, createAction, updateAction, reset, ref, onDismiss, subtasks, removedIds, queryClient],
    );

    return (
      <FormSheet ref={ref} title={isEdit ? 'Edit Action' : 'New Action'} accentColor={colors.actions.primary}>
        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Title"
              placeholder="What needs doing?"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
              autoFocus={!isEdit}
            />
          )}
        />

        {/* Notes */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Notes"
              placeholder="Any extra context..."
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              style={{ minHeight: 72, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Date */}
        <View style={{ gap: spacing.xs }}>
          <TextInput label="Date" editable={false} value="" style={{ display: 'none' }} />
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {DATE_OPTIONS.map((opt) => {
              const optValue = opt.value();
              const isSelected = scheduledDate === optValue;
              return (
                <Chip
                  key={opt.label}
                  label={opt.label}
                  selected={isSelected}
                  color={colors.actions.primary}
                  onPress={() => setValue('scheduledDate', optValue, { shouldValidate: true })}
                />
              );
            })}
          </View>
        </View>

        {/* Session */}
        <View style={{ gap: spacing.xs }}>
          <TextInput label="Session" editable={false} value="" style={{ display: 'none' }} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {SESSIONS.map((s) => (
              <Chip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                selected={scheduledSession === s}
                color={colors.actions.primary}
                onPress={() =>
                  setValue('scheduledSession', scheduledSession === s ? undefined : s, {
                    shouldValidate: true,
                  })
                }
              />
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={{ gap: spacing.xs }}>
          <TextInput label="Priority" editable={false} value="" style={{ display: 'none' }} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={p === 'high' ? 'High' : 'Normal'}
                selected={priority === p}
                color={p === 'high' ? colors.error : colors.actions.primary}
                onPress={() => setValue('priority', p, { shouldValidate: true })}
              />
            ))}
          </View>
        </View>

        {/* Hold toggle */}
        <Chip
          label={isHeld ? 'On Hold' : 'Not on Hold'}
          selected={!!isHeld}
          color={colors.warning}
          onPress={() => setValue('isHeld', !isHeld, { shouldValidate: true })}
        />

        {/* Subtasks */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.text.secondary,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Subtasks
          </Text>

          {subtasks.map((st, index) => (
            <View
              key={index}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Subtask title"
                  value={st.title}
                  onChangeText={(text) => updateSubtaskTitle(index, text)}
                />
              </View>
              <Pressable
                onPress={() => removeSubtask(index)}
                hitSlop={8}
                style={{ padding: spacing.xs }}
              >
                <Ionicons name="close-circle" size={22} color={colors.text.secondary} />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={addSubtask}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.actions.primary} />
            <Text style={{ fontSize: fontSize.sm, color: colors.actions.primary }}>
              Add subtask
            </Text>
          </Pressable>
        </View>

        {/* Submit */}
        <View style={{ marginTop: spacing.md }}>
          <Button
            title={isEdit ? 'Save Changes' : 'Create Action'}
            variant="primary"
            size="lg"
            accentColor={colors.actions.primary}
            onPress={handleSubmit(onSubmit)}
            loading={createAction.isPending || updateAction.isPending}
          />
        </View>
      </FormSheet>
    );
  },
);

ActionFormSheet.displayName = 'ActionFormSheet';
