import { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, spacing, fontSize, borderRadius, shadows, fontFamily } from '@/lib/theme';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import {
  ActionFormSheet,
  RoutineFormSheet,
  GuideItemFormSheet,
  StrategyFormSheet,
} from '@/components/sheets';
import { useCreateOpenLoop } from '@/features/capture/hooks/useOpenLoops';

// ── Icons ─────────────────────────────────────────────────────────────────────

function ActionIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 11l3 3 8-8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RoutineIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M17 2l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 11V9a4 4 0 014-4h14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 22l-4-4 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LoopIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CodeIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StrategyIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={6} cy={18} r={3} stroke={color} strokeWidth={2} />
      <Circle cx={18} cy={16} r={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

// ── Option definitions ─────────────────────────────────────────────────────────

const OPTIONS = [
  {
    id: 'action' as const,
    label: 'Action',
    description: 'A one-time task to complete',
    color: colors.actions.primary,
    Icon: ActionIcon,
  },
  {
    id: 'routine' as const,
    label: 'Routine',
    description: 'A recurring habit or ritual',
    color: colors.routines.primary,
    Icon: RoutineIcon,
  },
  {
    id: 'loop' as const,
    label: 'Open Loop',
    description: 'A thought to capture and process later',
    color: colors.capture.primary,
    Icon: LoopIcon,
  },
  {
    id: 'code' as const,
    label: 'Code',
    description: 'A principle or value to live by',
    color: colors.guide.primary,
    Icon: CodeIcon,
  },
  {
    id: 'strategy' as const,
    label: 'Strategy',
    description: 'A playbook for a tough situation',
    color: colors.strategies.primary,
    Icon: StrategyIcon,
  },
] as const;

type OptionId = (typeof OPTIONS)[number]['id'];

// ── Component ─────────────────────────────────────────────────────────────────

interface CreateDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateDrawer({ visible, onClose }: CreateDrawerProps) {
  const insets = useSafeAreaInsets();

  // Animation
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const drawerTranslateY = useRef(new Animated.Value(400)).current;
  const [modalMounted, setModalMounted] = useState(false);

  // Form sheet refs
  const actionFormRef = useRef<FormSheetRef>(null);
  const guideFormRef = useRef<FormSheetRef>(null);
  const strategyFormRef = useRef<FormSheetRef>(null);
  const [routineSheetOpen, setRoutineSheetOpen] = useState(false);

  // Quick loop capture
  const [loopSheetOpen, setLoopSheetOpen] = useState(false);
  const [loopText, setLoopText] = useState('');
  const createOpenLoop = useCreateOpenLoop();

  // Mount modal before animating in so children are ready
  useEffect(() => {
    if (visible) {
      setModalMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(drawerTranslateY, {
          toValue: 0,
          tension: 70,
          friction: 13,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(drawerTranslateY, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setModalMounted(false));
    }
  }, [visible, backdropOpacity, drawerTranslateY]);

  const handleSelect = useCallback(
    (id: OptionId) => {
      onClose();
      setTimeout(() => {
        if (id === 'action') actionFormRef.current?.present();
        else if (id === 'routine') setRoutineSheetOpen(true);
        else if (id === 'loop') setLoopSheetOpen(true);
        else if (id === 'code') guideFormRef.current?.present();
        else if (id === 'strategy') strategyFormRef.current?.present();
      }, 120);
    },
    [onClose],
  );

  const handleSubmitLoop = useCallback(() => {
    const trimmed = loopText.trim();
    if (!trimmed) return;
    createOpenLoop.mutate({ title: trimmed });
    setLoopText('');
    setLoopSheetOpen(false);
  }, [loopText, createOpenLoop]);

  return (
    <>
      {/* ── Main drawer modal ── */}
      {modalMounted && (
        <Modal
          visible={modalMounted}
          transparent
          animationType="none"
          onRequestClose={onClose}
          statusBarTranslucent
        >
          {/* Blurred backdrop */}
          <Animated.View
            style={{ flex: 1, opacity: backdropOpacity }}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: 'rgba(6, 7, 12, 0.78)',
              }}
              onPress={onClose}
            />
          </Animated.View>

          {/* Drawer */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.surface,
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
                paddingBottom: insets.bottom + spacing.md,
                transform: [{ translateY: drawerTranslateY }],
              },
              shadows.lg,
            ]}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  backgroundColor: colors.border,
                  borderRadius: borderRadius.full,
                }}
              />
            </View>

            {/* Options */}
            {OPTIONS.map((opt, index) => (
              <Pressable
                key={opt.id}
                onPress={() => handleSelect(opt.id)}
                style={({ pressed }: { pressed: boolean }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  backgroundColor: pressed ? colors.surfaceRaised : 'transparent',
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.borderSubtle,
                })}
              >
                {/* Icon pill */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: borderRadius.md,
                    backgroundColor: opt.color + '1A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <opt.Icon color={opt.color} />
                </View>

                {/* Labels */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontFamily: fontFamily.generalSansSemibold,
                      color: colors.text.primary,
                      letterSpacing: 0.1,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      fontFamily: fontFamily.generalSansRegular,
                      color: colors.text.secondary,
                      marginTop: 2,
                    }}
                  >
                    {opt.description}
                  </Text>
                </View>

                {/* Chevron */}
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18l6-6-6-6"
                    stroke={colors.text.muted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            ))}
          </Animated.View>
        </Modal>
      )}

      {/* ── Quick loop capture modal ── */}
      <Modal
        visible={loopSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLoopSheetOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(6, 7, 12, 0.7)' }}
          onPress={() => setLoopSheetOpen(false)}
        />
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.lg,
            gap: spacing.sm,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xs }}>
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: borderRadius.full,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: fontSize.md,
              fontFamily: fontFamily.generalSansSemibold,
              color: colors.text.primary,
            }}
          >
            Capture a thought
          </Text>

          <RNTextInput
            placeholder="What's on your mind?"
            placeholderTextColor={colors.text.muted}
            value={loopText}
            onChangeText={setLoopText}
            onSubmitEditing={handleSubmitLoop}
            returnKeyType="done"
            autoFocus
            multiline={false}
            style={{
              backgroundColor: colors.surfaceRaised,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.sm,
              fontSize: fontSize.base,
              fontFamily: fontFamily.generalSansRegular,
              color: colors.text.primary,
            }}
          />

          <Pressable
            onPress={handleSubmitLoop}
            style={({ pressed }: { pressed: boolean }) => ({
              backgroundColor: colors.capture.primary,
              borderRadius: borderRadius.md,
              paddingVertical: spacing.sm,
              alignItems: 'center',
              opacity: pressed || !loopText.trim() ? 0.6 : 1,
            })}
            disabled={!loopText.trim()}
          >
            <Text
              style={{
                fontSize: fontSize.base,
                fontFamily: fontFamily.generalSansSemibold,
                color: colors.background,
              }}
            >
              Capture
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Form sheets ── */}
      <ActionFormSheet
        ref={actionFormRef}
        editId={undefined}
        editData={null}
      />

      <RoutineFormSheet
        visible={routineSheetOpen}
        onDismiss={() => setRoutineSheetOpen(false)}
        editId={undefined}
        editData={null}
      />

      <GuideItemFormSheet
        ref={guideFormRef}
        editId={undefined}
        editData={null}
      />

      <StrategyFormSheet
        ref={strategyFormRef}
        editId={undefined}
        editData={null}
      />
    </>
  );
}
