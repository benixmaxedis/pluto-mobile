import { forwardRef, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput as RNTextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type FormSheetRef } from './FormSheet';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionSchema, type ActionFormData } from '@/lib/validation';
import { useCreateAction, useUpdateAction, useCreateSubtask, useDeleteSubtask } from '@/features/actions/hooks/useActionMutations';
import { useActionSubtasks } from '@/features/actions/hooks/useActions';
import { TextInput, Button, Chip } from '@/components/ui';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize, borderRadius, fontFamily } from '@/lib/theme';
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
  visible?: boolean;
  onDismiss?: () => void;
}

export const ActionFormSheet = forwardRef<FormSheetRef, ActionFormSheetProps>(
  ({ editId, editData, visible, onDismiss }, ref) => {
    const createAction = useCreateAction();
    const updateAction = useUpdateAction();
    const createSubtask = useCreateSubtask();
    const deleteSubtask = useDeleteSubtask();
    const { data: savedSubtasks } = useActionSubtasks(editId ?? null);
    const [subtaskInput, setSubtaskInput] = useState('');
    // Pending subtasks for create mode (local-only until action is saved)
    const [pendingSubtasks, setPendingSubtasks] = useState<string[]>([]);
    const isEdit = !!editId;

    const handleAddSubtask = useCallback(() => {
      const title = subtaskInput.trim();
      if (!title) return;
      if (isEdit && editId) {
        createSubtask.mutate({
          actionId: editId,
          title,
          sortOrder: savedSubtasks?.length ?? 0,
        });
      } else {
        setPendingSubtasks((prev) => [...prev, title]);
      }
      setSubtaskInput('');
    }, [subtaskInput, isEdit, editId, createSubtask, savedSubtasks?.length]);

    const handleRemovePending = useCallback((index: number) => {
      setPendingSubtasks((prev) => prev.filter((_, i) => i !== index));
    }, []);

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
        setPendingSubtasks([]);
        setSubtaskInput('');
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
                (ref as React.RefObject<FormSheetRef | null> | null)?.current?.dismiss();
                onDismiss?.();
              },
            },
          );
        } else {
          createAction.mutate(data, {
            onSuccess: (newId) => {
              pendingSubtasks.forEach((title, idx) => {
                createSubtask.mutate({ actionId: newId as string, title, sortOrder: idx });
              });
              setPendingSubtasks([]);
              reset();
              (ref as React.RefObject<FormSheetRef | null> | null)?.current?.dismiss();
              onDismiss?.();
            },
          });
        }
      },
      [isEdit, editId, createAction, updateAction, createSubtask, pendingSubtasks, reset, ref, onDismiss],
    );

    return (
      <FormSheet ref={ref} title={isEdit ? 'Edit Action' : 'New Action'} accentColor={colors.actions.primary} visible={visible} onDismiss={onDismiss}>
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
                  onPress={() => setValue('scheduledDate', optValue, { shouldDirty: true })}
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
                    shouldDirty: true,
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
                onPress={() => setValue('priority', p, { shouldDirty: true })}
              />
            ))}
          </View>
        </View>

        {/* Hold toggle */}
        <Chip
          label={isHeld ? 'On Hold' : 'Not on Hold'}
          selected={!!isHeld}
          color={colors.warning}
          onPress={() => setValue('isHeld', !isHeld, { shouldDirty: true })}
        />

        {/* Subtasks */}
        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>
            Subtasks
          </Text>

          {/* Saved subtasks (edit mode) */}
          {isEdit && savedSubtasks && savedSubtasks.length > 0 && (
            <View style={{ borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              {savedSubtasks.map((sub, idx) => (
                <View key={sub.id}>
                  {idx > 0 && <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: spacing.md }} />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm, backgroundColor: colors.surface }}>
                    {sub.isCompleted
                      ? <FontAwesome name="check-circle" size={14} color={colors.success} />
                      : <Ionicons name="ellipse-outline" size={14} color={colors.text.secondary} />
                    }
                    <Text
                      style={{ flex: 1, fontFamily: fontFamily.generalSansMedium, fontSize: fontSize.base, color: sub.isCompleted ? colors.text.secondary : colors.text.primary, textDecorationLine: sub.isCompleted ? 'line-through' : 'none' }}
                      numberOfLines={2}
                    >
                      {sub.title}
                    </Text>
                    <Pressable onPress={() => deleteSubtask.mutate(sub.id)} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })} hitSlop={8}>
                      <Ionicons name="close" size={16} color={colors.text.muted} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Pending subtasks (create mode) */}
          {!isEdit && pendingSubtasks.length > 0 && (
            <View style={{ borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              {pendingSubtasks.map((title, idx) => (
                <View key={idx}>
                  {idx > 0 && <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: spacing.md }} />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm, backgroundColor: colors.surface }}>
                    <Ionicons name="ellipse-outline" size={14} color={colors.text.secondary} />
                    <Text style={{ flex: 1, fontFamily: fontFamily.generalSansMedium, fontSize: fontSize.base, color: colors.text.primary }} numberOfLines={2}>
                      {title}
                    </Text>
                    <Pressable onPress={() => handleRemovePending(idx)} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })} hitSlop={8}>
                      <Ionicons name="close" size={16} color={colors.text.muted} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add subtask input */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <RNTextInput
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              placeholder="Add a subtask…"
              placeholderTextColor={colors.text.secondary}
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={handleAddSubtask}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                color: colors.text.primary,
                fontSize: fontSize.base,
                fontFamily: fontFamily.generalSansRegular,
              }}
            />
            <Pressable
              onPress={handleAddSubtask}
              style={({ pressed }) => ({ backgroundColor: colors.actions.primary + '22', borderRadius: borderRadius.md, padding: spacing.sm, opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons name="add" size={20} color={colors.actions.primary} />
            </Pressable>
          </View>
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
