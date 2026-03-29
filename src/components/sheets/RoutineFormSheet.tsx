import { useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoutineTemplateSchema, type RoutineTemplateFormData } from '@/lib/validation';
import { useCreateTemplate, useUpdateTemplate } from '@/features/routines/hooks/useRoutineMutations';
import { TextInput, Button, Chip } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize } from '@/lib/theme';
import { LifeCategory } from '@/lib/constants';

const SESSIONS = ['morning', 'afternoon', 'evening'] as const;
const RECURRENCE_TYPES = ['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually'] as const;
const RECURRENCE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
};

const CATEGORY_ENTRIES = Object.entries(LifeCategory).map(([key, value]) => ({
  label: value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
  value,
}));

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface RoutineFormSheetProps {
  visible: boolean;
  onDismiss: () => void;
  editId?: string | null;
  editData?: Partial<RoutineTemplateFormData> | null;
}

export function RoutineFormSheet({ visible, onDismiss, editId, editData }: RoutineFormSheetProps) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const isEdit = !!editId;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoutineTemplateFormData>({
    resolver: zodResolver(RoutineTemplateSchema),
    defaultValues: {
      title: '',
      notes: '',
      category: 'health',
      defaultSession: undefined,
      recurrenceType: 'weekly',
      recurrenceDaysJson: JSON.stringify([1, 2, 3, 4, 5]),
    },
  });

  useEffect(() => {
    if (editData) {
      reset({
        title: editData.title ?? '',
        notes: editData.notes ?? '',
        category: editData.category ?? 'health',
        defaultSession: editData.defaultSession ?? undefined,
        recurrenceType: editData.recurrenceType ?? 'weekly',
        recurrenceDaysJson: editData.recurrenceDaysJson ?? JSON.stringify([1, 2, 3, 4, 5]),
      });
    } else {
      reset({
        title: '',
        notes: '',
        category: 'health',
        defaultSession: undefined,
        recurrenceType: 'weekly',
        recurrenceDaysJson: JSON.stringify([1, 2, 3, 4, 5]),
      });
    }
  }, [editData, reset]);

  const category = watch('category');
  const defaultSession = watch('defaultSession');
  const recurrenceType = watch('recurrenceType');
  const recurrenceDaysJson = watch('recurrenceDaysJson');
  const selectedDays: number[] = recurrenceDaysJson ? JSON.parse(recurrenceDaysJson) : [];

  const toggleDay = useCallback(
    (dayIndex: number) => {
      const next = selectedDays.includes(dayIndex)
        ? selectedDays.filter((d) => d !== dayIndex)
        : [...selectedDays, dayIndex].sort();
      setValue('recurrenceDaysJson', JSON.stringify(next), { shouldValidate: true });
    },
    [selectedDays, setValue],
  );

  const onSubmit = useCallback(
    (data: RoutineTemplateFormData) => {
      if (isEdit && editId) {
        updateTemplate.mutate(
          { id: editId, data },
          {
            onSuccess: () => {
              reset();
              onDismiss();
            },
          },
        );
      } else {
        createTemplate.mutate(data, {
          onSuccess: () => {
            reset();
            onDismiss();
          },
        });
      }
    },
    [isEdit, editId, createTemplate, updateTemplate, reset, onDismiss],
  );

  return (
    <FormSheet
      visible={visible}
      onDismiss={onDismiss}
      title={isEdit ? 'Edit Routine' : 'New Routine'}
      accentColor={colors.routines.primary}
    >
      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Title"
            placeholder="e.g. Morning workout"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
          />
        )}
      />

      {/* Category */}
      <View style={{ gap: spacing.xs }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>Category</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {CATEGORY_ENTRIES.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              selected={category === c.value}
              color={colors.routines.primary}
              onPress={() => setValue('category', c.value as any, { shouldValidate: true })}
            />
          ))}
        </View>
      </View>

      {/* Recurrence */}
      <View style={{ gap: spacing.xs }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>Recurrence</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {RECURRENCE_TYPES.map((r) => (
            <Chip
              key={r}
              label={RECURRENCE_LABELS[r]}
              selected={recurrenceType === r}
              color={colors.routines.primary}
              onPress={() => setValue('recurrenceType', r, { shouldValidate: true })}
            />
          ))}
        </View>
      </View>

      {/* Days of week (for weekly/fortnightly) */}
      {(recurrenceType === 'weekly' || recurrenceType === 'fortnightly') && (
        <View style={{ gap: spacing.xs }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>Days</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {DAYS.map((day, i) => (
              <Chip
                key={day}
                label={day}
                selected={selectedDays.includes(i + 1)}
                color={colors.routines.primary}
                onPress={() => toggleDay(i + 1)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Default Session */}
      <View style={{ gap: spacing.xs }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>
          Default Session
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {SESSIONS.map((s) => (
            <Chip
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              selected={defaultSession === s}
              color={colors.routines.primary}
              onPress={() =>
                setValue('defaultSession', defaultSession === s ? undefined : s, {
                  shouldValidate: true,
                })
              }
            />
          ))}
        </View>
      </View>

      {/* Notes */}
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Notes"
            placeholder="Optional notes..."
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={2}
            style={{ minHeight: 56, textAlignVertical: 'top' }}
          />
        )}
      />

      {/* Submit */}
      <View style={{ marginTop: spacing.md }}>
        <Button
          title={isEdit ? 'Save Changes' : 'Create Routine'}
          variant="primary"
          size="lg"
          accentColor={colors.routines.primary}
          onPress={() => handleSubmit(onSubmit)()}
          loading={createTemplate.isPending || updateTemplate.isPending}
        />
      </View>
    </FormSheet>
  );
}
