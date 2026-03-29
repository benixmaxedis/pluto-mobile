import { forwardRef, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GuideItemSchema, type GuideItemFormData } from '@/lib/validation';
import { useCreateGuideItem, useUpdateGuideItem } from '@/features/guide/hooks/useGuideItems';
import { TextInput, Button, Chip } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize } from '@/lib/theme';
import { GuideCategory } from '@/lib/constants';

const CATEGORIES = Object.values(GuideCategory).map((c) => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c,
}));

interface GuideItemFormSheetProps {
  editId?: string | null;
  editData?: Partial<GuideItemFormData> | null;
  defaultCategory?: string;
  visible?: boolean;
  onDismiss?: () => void;
}

export const GuideItemFormSheet = forwardRef<FormSheetRef, GuideItemFormSheetProps>(
  ({ editId, editData, defaultCategory, visible, onDismiss }, ref) => {
    const createGuideItem = useCreateGuideItem();
    const updateGuideItem = useUpdateGuideItem();
    const isEdit = !!editId;

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm<GuideItemFormData>({
      resolver: zodResolver(GuideItemSchema),
      defaultValues: {
        title: '',
        category: (defaultCategory as any) ?? 'identity',
        statement: '',
        meaning: '',
        exampleApplication: '',
      },
    });

    useEffect(() => {
      if (editData) {
        reset({
          title: editData.title ?? '',
          category: editData.category ?? (defaultCategory as any) ?? 'identity',
          statement: editData.statement ?? '',
          meaning: editData.meaning ?? '',
          exampleApplication: editData.exampleApplication ?? '',
        });
      } else {
        reset({
          title: '',
          category: (defaultCategory as any) ?? 'identity',
          statement: '',
          meaning: '',
          exampleApplication: '',
        });
      }
    }, [editData, defaultCategory, reset]);

    const category = watch('category');

    const onSubmit = useCallback(
      (data: GuideItemFormData) => {
        if (isEdit && editId) {
          updateGuideItem.mutate(
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
          createGuideItem.mutate(data, {
            onSuccess: () => {
              reset();
              (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
              onDismiss?.();
            },
          });
        }
      },
      [isEdit, editId, createGuideItem, updateGuideItem, reset, ref, onDismiss],
    );

    return (
      <FormSheet ref={ref} title={isEdit ? 'Edit Code Item' : 'New Code Item'} accentColor={colors.guide.primary} visible={visible} onDismiss={onDismiss}>
        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Title"
              placeholder="e.g. I am resourceful"
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
                color={colors.guide.primary}
                onPress={() => setValue('category', c.value as any, { shouldValidate: true })}
              />
            ))}
          </View>
        </View>

        {/* Statement */}
        <Controller
          control={control}
          name="statement"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Statement"
              placeholder="What does this mean to you?"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Meaning */}
        <Controller
          control={control}
          name="meaning"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Why it matters"
              placeholder="Why is this important?"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Example */}
        <Controller
          control={control}
          name="exampleApplication"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Example application"
              placeholder="How you live this out..."
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
            title={isEdit ? 'Save Changes' : 'Add to Code'}
            variant="primary"
            size="lg"
            accentColor={colors.guide.primary}
            onPress={handleSubmit(onSubmit)}
            loading={createGuideItem.isPending || updateGuideItem.isPending}
          />
        </View>
      </FormSheet>
    );
  },
);

GuideItemFormSheet.displayName = 'GuideItemFormSheet';
