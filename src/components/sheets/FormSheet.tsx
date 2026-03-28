import { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

export interface FormSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface FormSheetProps {
  title: string;
  accentColor?: string;
  children: React.ReactNode;
  /** When set, visibility is controlled by the parent (imperative `present` is a no-op). */
  visible?: boolean;
  /** Called when the sheet should close (controlled mode) or after dismiss via ref in uncontrolled mode. */
  onDismiss?: () => void;
}

export const FormSheet = forwardRef<FormSheetRef, FormSheetProps>(
  ({ title, accentColor = colors.actions.primary, children, visible: visibleProp, onDismiss }, ref) => {
    const [internalVisible, setInternalVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const controlled = visibleProp !== undefined;
    const visible = controlled ? visibleProp : internalVisible;

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          if (!controlled) setInternalVisible(true);
        },
        dismiss: () => {
          if (controlled) {
            onDismiss?.();
          } else {
            setInternalVisible(false);
          }
        },
      }),
      [controlled, onDismiss],
    );

    const handleClose = useCallback(() => {
      if (controlled) {
        onDismiss?.();
      } else {
        setInternalVisible(false);
      }
    }, [controlled, onDismiss]);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.surface }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Handle bar */}
          <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: borderRadius.full,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: '700',
                  color: colors.text.primary,
                }}
              >
                {title}
              </Text>
              <View
                style={{
                  width: 32,
                  height: 3,
                  backgroundColor: accentColor,
                  borderRadius: borderRadius.full,
                  marginTop: spacing.xs,
                }}
              />
            </View>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                backgroundColor: colors.surfaceElevated,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={{ color: colors.text.secondary, fontSize: fontSize.md, fontWeight: '600' }}>
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing['3xl'] + insets.bottom,
              gap: spacing.md,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

FormSheet.displayName = 'FormSheet';
