import { forwardRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionSchema, type ActionFormData } from '@/lib/validation';
import { useCreateAction, useUpdateAction } from '@/features/actions/hooks/useActionMutations';

type ActionFormValues = {
  title: string;
  notes?: string;
  scheduledDate?: string;
  scheduledSession?: 'morning' | 'afternoon' | 'evening';
  priority: 'normal' | 'high';
  isHeld: boolean;
  subtasks: Array<{
    id?: string;
    title: string;
    isCompleted?: boolean;
    completedAt?: string | null;
    createdAt?: string;
  }>;
};
import { TextInput, Button, Chip } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing } from '@/lib/theme';
import { todayISO, toISODate } from '@/lib/utils/date';
import { addDays } from 'date-fns';

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
    const isEdit = !!editId;

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
        subtasks: [],
      },
    });
    const { fields: subtaskFields, append, remove } = useFieldArray({
      control,
      name: 'subtasks',
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
          subtasks:
            editData.subtasks?.map((subtask) => ({
              id: subtask.id,
              title: subtask.title ?? '',
              isCompleted: subtask.isCompleted ?? false,
              completedAt: subtask.completedAt ?? null,
              createdAt: subtask.createdAt,
            })) ?? [],
        });
      } else {
        reset({
          title: '',
          notes: '',
          scheduledDate: todayISO(),
          scheduledSession: undefined,
          priority: 'normal',
          isHeld: false,
          subtasks: [],
        });
      }
    }, [editData, reset]);

    const scheduledDate = watch('scheduledDate');
    const scheduledSession = watch('scheduledSession');
    const priority = watch('priority');
    const isHeld = watch('isHeld');

    const onSubmit: SubmitHandler<ActionFormValues> = useCallback(
      (data) => {
        const subtasks = (data.subtasks ?? [])
          .map((subtask) => ({
            ...subtask,
            title: subtask.title.trim(),
          }))
          .filter((subtask) => subtask.title.length > 0);
        const payload = { ...data, subtasks };

        if (isEdit && editId) {
          updateAction.mutate(
            { id: editId, data: payload },
            {
              onSuccess: () => {
                reset();
                (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
                onDismiss?.();
              },
            },
          );
        } else {
          createAction.mutate(payload, {
            onSuccess: () => {
              reset();
              (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
              onDismiss?.();
            },
          });
        }
      },
      [isEdit, editId, createAction, updateAction, reset, ref, onDismiss],
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
          <Text style={{ color: colors.text.secondary }}>Subtasks</Text>
          {subtaskFields.map((field, index) => (
            <View key={field.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name={`subtasks.${index}.title`}
                  render={({ field: subtaskField }) => (
                    <TextInput
                      placeholder={`Subtask ${index + 1}`}
                      value={subtaskField.value ?? ''}
                      onChangeText={subtaskField.onChange}
                      onBlur={subtaskField.onBlur}
                    />
                  )}
                />
              </View>
              <Pressable
                onPress={() => remove(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remove subtask ${index + 1}`}
                hitSlop={8}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 18, lineHeight: 20 }}>×</Text>
              </Pressable>
            </View>
          ))}
          <Button
            title="Add subtask"
            variant="secondary"
            size="md"
            accentColor={colors.actions.primary}
            onPress={() =>
              append({
                title: '',
              })
            }
          />
          {typeof errors.subtasks?.message === 'string' && (
            <Text style={{ color: colors.error }}>{errors.subtasks.message}</Text>
          )}
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
