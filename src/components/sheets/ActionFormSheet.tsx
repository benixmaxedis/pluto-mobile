import { forwardRef, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
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
    }, [editData, reset]);

    const scheduledDate = watch('scheduledDate');
    const scheduledSession = watch('scheduledSession');
    const priority = watch('priority');
    const isHeld = watch('isHeld');

    const onSubmit: SubmitHandler<ActionFormValues> = useCallback(
      (data) => {
        if (isEdit && editId) {
          updateAction.mutate(
            { id: editId, data },
            {
              onSuccess: () => {
                reset();
                (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
                onDismiss?.();
              },
            },
          );
        } else {
          createAction.mutate(data, {
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
