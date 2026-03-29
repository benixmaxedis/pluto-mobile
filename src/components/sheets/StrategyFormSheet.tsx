import { forwardRef, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StrategySchema, type StrategyFormData } from '@/lib/validation';
import { useCreateStrategy, useUpdateStrategy } from '@/features/guide/hooks/useStrategies';
import { TextInput, Button, Chip } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize } from '@/lib/theme';
import { LifeCategory } from '@/lib/constants';

const CATEGORIES = Object.entries(LifeCategory).map(([key, value]) => ({
  label: value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
  value,
}));

interface StrategyFormSheetProps {
  editId?: string | null;
  editData?: Partial<StrategyFormData> | null;
  defaultCategory?: string;
  visible?: boolean;
  onDismiss?: () => void;
}

export const StrategyFormSheet = forwardRef<FormSheetRef, StrategyFormSheetProps>(
  ({ editId, editData, defaultCategory, visible, onDismiss }, ref) => {
    const createStrategy = useCreateStrategy();
    const updateStrategy = useUpdateStrategy();
    const isEdit = !!editId;

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm<StrategyFormData>({
      resolver: zodResolver(StrategySchema),
      defaultValues: {
        title: '',
        category: (defaultCategory as any) ?? 'health',
        triggerText: '',
        contextText: '',
        responseStepsMarkdown: '',
        whyItMatters: '',
      },
    });

    useEffect(() => {
      if (editData) {
        reset({
          title: editData.title ?? '',
          category: editData.category ?? (defaultCategory as any) ?? 'health',
          triggerText: editData.triggerText ?? '',
          contextText: editData.contextText ?? '',
          responseStepsMarkdown: editData.responseStepsMarkdown ?? '',
          whyItMatters: editData.whyItMatters ?? '',
        });
      } else {
        reset({
          title: '',
          category: (defaultCategory as any) ?? 'health',
          triggerText: '',
          contextText: '',
          responseStepsMarkdown: '',
          whyItMatters: '',
        });
      }
    }, [editData, defaultCategory, reset]);

    const category = watch('category');

    const onSubmit = useCallback(
      (data: StrategyFormData) => {
        if (isEdit && editId) {
          updateStrategy.mutate(
            { id: editId, data },
            {
              onSuccess: () => {
                reset();
                (ref as React.RefObject<FormSheetRef | null> | null)?.current?.dismiss();
                onDismiss?.();
              },
            },
          );
        } else {
          createStrategy.mutate(data, {
            onSuccess: () => {
              reset();
              (ref as React.RefObject<FormSheetRef | null> | null)?.current?.dismiss();
              onDismiss?.();
            },
          });
        }
      },
      [isEdit, editId, createStrategy, updateStrategy, reset, ref, onDismiss],
    );

    return (
      <FormSheet
        ref={ref}
        title={isEdit ? 'Edit Strategy' : 'New Strategy'}
        accentColor={colors.strategies.primary}
        visible={visible}
        onDismiss={onDismiss}
      >
        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Title"
              placeholder="e.g. When I feel overwhelmed..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
              autoFocus={!isEdit}
            />
          )}
        />

        {/* Category */}
        <View style={{ gap: spacing.xs }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>Category</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.value}
                label={c.label}
                selected={category === c.value}
                color={colors.strategies.primary}
                onPress={() => setValue('category', c.value as any, { shouldValidate: true })}
              />
            ))}
          </View>
        </View>

        {/* Trigger */}
        <Controller
          control={control}
          name="triggerText"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Trigger"
              placeholder="When does this strategy apply?"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Context */}
        <Controller
          control={control}
          name="contextText"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Context"
              placeholder="What's usually happening when this comes up?"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Response Steps */}
        <Controller
          control={control}
          name="responseStepsMarkdown"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Response steps"
              placeholder="What do you do? (one step per line)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              style={{ minHeight: 88, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Why it matters */}
        <Controller
          control={control}
          name="whyItMatters"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Why it matters"
              placeholder="What makes this strategy work for you?"
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
            title={isEdit ? 'Save Changes' : 'Create Strategy'}
            variant="primary"
            size="lg"
            accentColor={colors.strategies.primary}
            onPress={handleSubmit(onSubmit)}
            loading={createStrategy.isPending || updateStrategy.isPending}
          />
        </View>
      </FormSheet>
    );
  },
);

StrategyFormSheet.displayName = 'StrategyFormSheet';
