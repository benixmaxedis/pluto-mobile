import { forwardRef, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MorningJournalSchema,
  EveningJournalSchema,
  type MorningJournalFormData,
  type EveningJournalFormData,
} from '@/lib/validation';
import { useSaveJournal } from '@/features/capture/hooks/useJournal';
import { TextInput, Button } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize } from '@/lib/theme';

interface JournalFormSheetProps {
  journalType: 'morning' | 'evening';
  date: string;
  existingData?: Record<string, unknown> | null;
  onDismiss?: () => void;
}

function MorningForm({
  date,
  existingData,
  onDismiss,
  sheetRef,
}: {
  date: string;
  existingData?: Record<string, unknown> | null;
  onDismiss?: () => void;
  sheetRef: React.RefObject<FormSheetRef | null>;
}) {
  const saveJournal = useSaveJournal();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MorningJournalFormData>({
    resolver: zodResolver(MorningJournalSchema),
    defaultValues: {
      gratitude1: '',
      gratitude2: '',
      gratitude3: '',
      intention1: '',
      intention2: '',
      intention3: '',
      affirmation: '',
    },
  });

  useEffect(() => {
    if (existingData) {
      reset(existingData as MorningJournalFormData);
    }
  }, [existingData, reset]);

  const onSubmit = useCallback(
    (data: MorningJournalFormData) => {
      saveJournal.mutate(
        { date, type: 'morning', answers: data },
        {
          onSuccess: () => {
            reset();
            sheetRef.current?.dismiss();
            onDismiss?.();
          },
        },
      );
    },
    [date, saveJournal, reset, sheetRef, onDismiss],
  );

  return (
    <>
      <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '600', textTransform: 'uppercase' }}>
        I am grateful for...
      </Text>
      {(['gratitude1', 'gratitude2', 'gratitude3'] as const).map((field, i) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder={`Gratitude ${i + 1}`}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors[field]?.message}
            />
          )}
        />
      ))}

      <Text
        style={{
          fontSize: fontSize.sm,
          color: colors.text.secondary,
          fontWeight: '600',
          textTransform: 'uppercase',
          marginTop: spacing.sm,
        }}
      >
        What would make today great?
      </Text>
      {(['intention1', 'intention2', 'intention3'] as const).map((field, i) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder={`Intention ${i + 1}`}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors[field]?.message}
            />
          )}
        />
      ))}

      <Text
        style={{
          fontSize: fontSize.sm,
          color: colors.text.secondary,
          fontWeight: '600',
          textTransform: 'uppercase',
          marginTop: spacing.sm,
        }}
      >
        Daily affirmation
      </Text>
      <Controller
        control={control}
        name="affirmation"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="I am..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.affirmation?.message}
          />
        )}
      />

      <View style={{ marginTop: spacing.md }}>
        <Button
          title="Save Morning Journal"
          variant="primary"
          size="lg"
          accentColor={colors.capture.primary}
          onPress={handleSubmit(onSubmit)}
          loading={saveJournal.isPending}
        />
      </View>
    </>
  );
}

function EveningForm({
  date,
  existingData,
  onDismiss,
  sheetRef,
}: {
  date: string;
  existingData?: Record<string, unknown> | null;
  onDismiss?: () => void;
  sheetRef: React.RefObject<FormSheetRef | null>;
}) {
  const saveJournal = useSaveJournal();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EveningJournalFormData>({
    resolver: zodResolver(EveningJournalSchema),
    defaultValues: {
      amazing1: '',
      amazing2: '',
      amazing3: '',
      improvement: '',
    },
  });

  useEffect(() => {
    if (existingData) {
      reset(existingData as EveningJournalFormData);
    }
  }, [existingData, reset]);

  const onSubmit = useCallback(
    (data: EveningJournalFormData) => {
      saveJournal.mutate(
        { date, type: 'evening', answers: data },
        {
          onSuccess: () => {
            reset();
            sheetRef.current?.dismiss();
            onDismiss?.();
          },
        },
      );
    },
    [date, saveJournal, reset, sheetRef, onDismiss],
  );

  return (
    <>
      <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '600', textTransform: 'uppercase' }}>
        3 amazing things that happened today
      </Text>
      {(['amazing1', 'amazing2', 'amazing3'] as const).map((field, i) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder={`Amazing thing ${i + 1}`}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors[field]?.message}
            />
          )}
        />
      ))}

      <Text
        style={{
          fontSize: fontSize.sm,
          color: colors.text.secondary,
          fontWeight: '600',
          textTransform: 'uppercase',
          marginTop: spacing.sm,
        }}
      >
        How could today have been even better?
      </Text>
      <Controller
        control={control}
        name="improvement"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="I could have..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.improvement?.message}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />
        )}
      />

      <View style={{ marginTop: spacing.md }}>
        <Button
          title="Save Evening Journal"
          variant="primary"
          size="lg"
          accentColor={colors.capture.primary}
          onPress={handleSubmit(onSubmit)}
          loading={saveJournal.isPending}
        />
      </View>
    </>
  );
}

export const JournalFormSheet = forwardRef<FormSheetRef, JournalFormSheetProps>(
  ({ journalType, date, existingData, onDismiss }, ref) => {
    const title = journalType === 'morning' ? 'Morning Journal' : 'Evening Journal';
    const sheetRef = ref as React.RefObject<FormSheetRef | null>;

    return (
      <FormSheet ref={ref} title={title} accentColor={colors.capture.primary}>
        {journalType === 'morning' ? (
          <MorningForm date={date} existingData={existingData} onDismiss={onDismiss} sheetRef={sheetRef} />
        ) : (
          <EveningForm date={date} existingData={existingData} onDismiss={onDismiss} sheetRef={sheetRef} />
        )}
      </FormSheet>
    );
  },
);

JournalFormSheet.displayName = 'JournalFormSheet';
