import { forwardRef, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { type FormSheetRef } from './FormSheet';
import { useConvertOpenLoop } from '@/features/capture/hooks/useOpenLoops';
import { useCreateAction } from '@/features/actions/hooks/useActionMutations';
import { useCreateTemplate } from '@/features/routines/hooks/useRoutineMutations';
import { FormSheet } from './FormSheet';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { todayISO } from '@/lib/utils/date';

interface ConvertOpenLoopSheetProps {
  loopId: string | null;
  loopTitle: string;
  onDismiss?: () => void;
}

export const ConvertOpenLoopSheet = forwardRef<FormSheetRef, ConvertOpenLoopSheetProps>(
  ({ loopId, loopTitle, onDismiss }, ref) => {
    const convertOpenLoop = useConvertOpenLoop();
    const createAction = useCreateAction();
    const createTemplate = useCreateTemplate();

    const handleConvertToAction = useCallback(() => {
      if (!loopId) return;

      createAction.mutate(
        {
          title: loopTitle,
          scheduledDate: todayISO(),
          priority: 'normal',
          isHeld: false,
        },
        {
          onSuccess: (newId) => {
            convertOpenLoop.mutate(
              { id: loopId, convertedToType: 'action', convertedToId: newId },
              {
                onSuccess: () => {
                  (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
                  onDismiss?.();
                },
              },
            );
          },
        },
      );
    }, [loopId, loopTitle, createAction, convertOpenLoop, ref, onDismiss]);

    const handleConvertToRoutine = useCallback(() => {
      if (!loopId) return;

      createTemplate.mutate(
        {
          title: loopTitle,
          category: 'other',
          recurrenceType: 'weekly',
          recurrenceDaysJson: JSON.stringify([1, 2, 3, 4, 5]),
        },
        {
          onSuccess: (newId) => {
            convertOpenLoop.mutate(
              { id: loopId, convertedToType: 'routine', convertedToId: newId },
              {
                onSuccess: () => {
                  (ref as React.RefObject<FormSheetRef | null>).current?.dismiss();
                  onDismiss?.();
                },
              },
            );
          },
        },
      );
    }, [loopId, loopTitle, createTemplate, convertOpenLoop, ref, onDismiss]);

    return (
      <FormSheet ref={ref} title="Convert Open Loop" accentColor={colors.capture.primary}>
        <Text style={{ fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.sm }}>
          Convert &ldquo;{loopTitle}&rdquo; into:
        </Text>

        <Pressable
          onPress={handleConvertToAction}
          style={({ pressed }) => ({
            backgroundColor: `${colors.actions.primary}15`,
            borderWidth: 1,
            borderColor: colors.actions.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.actions.primary }}>
            Action
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.xs }}>
            A one-time task scheduled for today
          </Text>
        </Pressable>

        <Pressable
          onPress={handleConvertToRoutine}
          style={({ pressed }) => ({
            backgroundColor: `${colors.routines.primary}15`,
            borderWidth: 1,
            borderColor: colors.routines.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.routines.primary }}>
            Routine
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.xs }}>
            A recurring task (weekdays by default)
          </Text>
        </Pressable>
      </FormSheet>
    );
  },
);

ConvertOpenLoopSheet.displayName = 'ConvertOpenLoopSheet';
