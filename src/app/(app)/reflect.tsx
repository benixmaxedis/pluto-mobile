import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import { useGuideItems } from '@/features/guide/hooks/useGuideItems';
import { useStrategies } from '@/features/guide/hooks/useStrategies';
import { useOpenLoops, useCreateOpenLoop, useArchiveOpenLoop } from '@/features/capture/hooks/useOpenLoops';
import { useJournalEntriesByDate } from '@/features/capture/hooks/useJournal';
import { toISODate } from '@/lib/utils/date';
import { colors, spacing, fontSize } from '@/lib/theme';
import { Card, EmptyState, SegmentedControl, TextInput, Button, TabSwipePager } from '@/components/ui';
import { ScreenTabHeader } from '@/components/navigation/ScreenTabHeader';
import { GuideItemCard } from '@/components/cards/GuideItemCard';
import { StrategyCard } from '@/components/cards/StrategyCard';
import { OpenLoopCard } from '@/components/cards/OpenLoopCard';
import { JournalCard } from '@/components/cards/JournalCard';
import {
  GuideItemFormSheet,
  StrategyFormSheet,
  ConvertOpenLoopSheet,
  JournalFormSheet,
} from '@/components/sheets';
import { GuideCategory, LifeCategory } from '@/lib/constants';
import { useUIStore } from '@/store/ui-store';

// ── Sub-tab labels ─────────────────────────────────────────────────────────────

const SECTIONS = ['Code', 'Strategies', 'Loops', 'Pluto', 'Journal'];

const GUIDE_CATEGORIES = Object.values(GuideCategory);
const GUIDE_CATEGORY_LABELS = GUIDE_CATEGORIES.map(
  (c) => c.charAt(0).toUpperCase() + c.slice(1),
);

const STRATEGY_CATEGORIES = Object.values(LifeCategory);
const STRATEGY_CATEGORY_LABELS = STRATEGY_CATEGORIES.map((c) =>
  c
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
);

// ── Accent per section ────────────────────────────────────────────────────────

const SECTION_ACCENT: Record<number, string> = {
  0: colors.guide.primary,
  1: colors.strategies.primary,
  2: colors.capture.primary,
  3: colors.emphasis.primary,
  4: colors.capture.primary,
};

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ReflectScreen() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState(0);

  // Code (guide items)
  const [guideCategoryIndex, setGuideCategoryIndex] = useState(0);
  const { data: allGuideItems, isLoading: guideLoading } = useGuideItems();
  const guideFormRef = useRef<FormSheetRef>(null);
  const [editGuideItem, setEditGuideItem] = useState<any>(null);

  // Strategies
  const [strategyCategoryIndex, setStrategyCategoryIndex] = useState(0);
  const { data: allStrategies, isLoading: strategiesLoading } = useStrategies();
  const strategyFormRef = useRef<FormSheetRef>(null);
  const [editStrategy, setEditStrategy] = useState<any>(null);

  // Loops (open loops)
  const [inputText, setInputText] = useState('');
  const { data: openLoops, isLoading: loopsLoading } = useOpenLoops();
  const createOpenLoop = useCreateOpenLoop();
  const archiveOpenLoop = useArchiveOpenLoop();
  const convertSheetRef = useRef<FormSheetRef>(null);
  const [convertLoop, setConvertLoop] = useState<{ id: string; title: string } | null>(null);

  // Journal
  const today = useMemo(() => toISODate(new Date()), []);
  const { data: journalEntries } = useJournalEntriesByDate(today);
  const journalSheetRef = useRef<FormSheetRef>(null);
  const [journalType, setJournalType] = useState<'morning' | 'evening'>('morning');

  // ── Derived data ──────────────────────────────────────────────────────────────

  const selectedGuideCategory = GUIDE_CATEGORIES[guideCategoryIndex];
  const selectedStrategyCategory = STRATEGY_CATEGORIES[strategyCategoryIndex];

  const guideItemsByCategoryIndex = useMemo(
    () =>
      GUIDE_CATEGORIES.map((cat) =>
        (allGuideItems ?? []).filter((item: any) => item.category === cat && !item.deletedAt),
      ),
    [allGuideItems],
  );

  const strategiesByCategoryIndex = useMemo(
    () =>
      STRATEGY_CATEGORIES.map((cat) =>
        (allStrategies ?? []).filter((item: any) => item.category === cat && !item.deletedAt),
      ),
    [allStrategies],
  );

  const activeLoops = useMemo(
    () => (openLoops ?? []).filter((loop: any) => loop.status === 'active'),
    [openLoops],
  );

  const morningEntry = useMemo(
    () => (journalEntries ?? []).find((e: any) => e.journalType === 'morning'),
    [journalEntries],
  );
  const eveningEntry = useMemo(
    () => (journalEntries ?? []).find((e: any) => e.journalType === 'evening'),
    [journalEntries],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleCreateGuideItem = useCallback(() => {
    setEditGuideItem(null);
    guideFormRef.current?.present();
  }, []);

  const handleEditGuideItem = useCallback((item: any) => {
    setEditGuideItem(item);
    guideFormRef.current?.present();
  }, []);

  const handleCreateStrategy = useCallback(() => {
    setEditStrategy(null);
    strategyFormRef.current?.present();
  }, []);

  const handleEditStrategy = useCallback((item: any) => {
    setEditStrategy(item);
    strategyFormRef.current?.present();
  }, []);

  const handleSubmitLoop = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    createOpenLoop.mutate({ title: trimmed });
    setInputText('');
  };

  const handleArchiveLoop = (id: string) => {
    archiveOpenLoop.mutate(id);
  };

  const handleConvertLoop = useCallback(
    (id: string) => {
      const loop = (openLoops ?? []).find((l: any) => l.id === id) as any;
      if (loop) {
        setConvertLoop({ id: loop.id, title: loop.title });
        convertSheetRef.current?.present();
      }
    },
    [openLoops],
  );

  const handleOpenJournal = useCallback((type: 'morning' | 'evening') => {
    setJournalType(type);
    journalSheetRef.current?.present();
  }, []);

  // ── Plus handler ──────────────────────────────────────────────────────────────

  const registerPlusHandler = useUIStore((s) => s.registerPlusHandler);
  const unregisterPlusHandler = useUIStore((s) => s.unregisterPlusHandler);

  useEffect(() => {
    let handler: (() => void) | null = null;
    if (selectedSection === 0) handler = handleCreateGuideItem;
    else if (selectedSection === 1) handler = handleCreateStrategy;
    // Loops, Pluto, Journal don't need a plus button action

    if (handler) {
      registerPlusHandler(handler);
    } else {
      unregisterPlusHandler();
    }
    return () => unregisterPlusHandler();
  }, [
    selectedSection,
    handleCreateGuideItem,
    handleCreateStrategy,
    registerPlusHandler,
    unregisterPlusHandler,
  ]);

  const accentColor = SECTION_ACCENT[selectedSection] ?? colors.capture.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenTabHeader title="Reflect">
          <SegmentedControl
            segments={SECTIONS}
            selectedIndex={selectedSection}
            onSelect={setSelectedSection}
            accentColor={accentColor}
            scrollable
            selectionStyle="neutral"
          />
        </ScreenTabHeader>

        <TabSwipePager
          selectedIndex={selectedSection}
          onIndexChange={setSelectedSection}
          style={{ flex: 1 }}
        >
          {/* ── Code ── */}
          <View style={{ flex: 1 }} collapsable={false}>
            <View style={{ marginBottom: spacing.md }}>
              <SegmentedControl
                segments={GUIDE_CATEGORY_LABELS}
                selectedIndex={guideCategoryIndex}
                onSelect={setGuideCategoryIndex}
                accentColor={colors.guide.primary}
                scrollable
              />
            </View>

            <TabSwipePager
              selectedIndex={guideCategoryIndex}
              onIndexChange={setGuideCategoryIndex}
              style={{ flex: 1 }}
            >
              {GUIDE_CATEGORIES.map((cat, catIdx) => {
                const items = guideItemsByCategoryIndex[catIdx] ?? [];
                return (
                  <View key={cat} style={{ flex: 1 }} collapsable={false}>
                    {items.length === 0 && !guideLoading ? (
                      <View style={{ paddingHorizontal: spacing.lg }}>
                        <EmptyState
                          message="Your personal code lives here."
                          accentColor={colors.guide.primary}
                        />
                      </View>
                    ) : (
                      <FlatList
                        data={items}
                        keyExtractor={(item: any) => item.id}
                        nestedScrollEnabled
                        contentContainerStyle={{
                          gap: spacing.sm,
                          paddingHorizontal: spacing.lg,
                          paddingBottom: spacing['3xl'] + 60,
                        }}
                        renderItem={({ item }: { item: any }) => (
                          <Pressable onPress={() => handleEditGuideItem(item)}>
                            <GuideItemCard
                              id={item.id}
                              title={item.title}
                              statement={item.statement}
                              category={item.category}
                            />
                          </Pressable>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                    )}
                  </View>
                );
              })}
            </TabSwipePager>
          </View>

          {/* ── Strategies ── */}
          <View style={{ flex: 1 }} collapsable={false}>
            <View style={{ marginBottom: spacing.md }}>
              <SegmentedControl
                segments={STRATEGY_CATEGORY_LABELS}
                selectedIndex={strategyCategoryIndex}
                onSelect={setStrategyCategoryIndex}
                accentColor={colors.strategies.primary}
                scrollable
              />
            </View>

            <TabSwipePager
              selectedIndex={strategyCategoryIndex}
              onIndexChange={setStrategyCategoryIndex}
              style={{ flex: 1 }}
            >
              {STRATEGY_CATEGORIES.map((cat, catIdx) => {
                const items = strategiesByCategoryIndex[catIdx] ?? [];
                return (
                  <View key={cat} style={{ flex: 1 }} collapsable={false}>
                    {items.length === 0 && !strategiesLoading ? (
                      <View style={{ paddingHorizontal: spacing.lg }}>
                        <EmptyState
                          message="Strategies are your playbooks for tough situations."
                          accentColor={colors.strategies.primary}
                        />
                      </View>
                    ) : (
                      <FlatList
                        data={items}
                        keyExtractor={(item: any) => item.id}
                        nestedScrollEnabled
                        contentContainerStyle={{
                          gap: spacing.sm,
                          paddingHorizontal: spacing.lg,
                          paddingBottom: spacing['3xl'] + 60,
                        }}
                        renderItem={({ item }: { item: any }) => (
                          <Pressable onPress={() => handleEditStrategy(item)}>
                            <StrategyCard
                              id={item.id}
                              title={item.title}
                              triggerText={item.triggerText}
                              category={item.category}
                            />
                          </Pressable>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                    )}
                  </View>
                );
              })}
            </TabSwipePager>
          </View>

          {/* ── Loops ── */}
          <View style={{ flex: 1, paddingHorizontal: spacing.lg }} collapsable={false}>
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.sm,
                marginBottom: spacing.md,
                marginTop: spacing.xs,
              }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Capture a thought..."
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSubmitLoop}
                  returnKeyType="done"
                />
              </View>
              <Button
                title="Add"
                variant="primary"
                size="md"
                accentColor={colors.capture.primary}
                onPress={handleSubmitLoop}
                loading={createOpenLoop.isPending}
                disabled={!inputText.trim()}
              />
            </View>

            {activeLoops.length === 0 && !loopsLoading ? (
              <EmptyState
                message="Capture a thought. Organize later."
                accentColor={colors.capture.primary}
              />
            ) : (
              <FlatList
                data={activeLoops}
                keyExtractor={(item: any) => item.id}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing['3xl'] }}
                renderItem={({ item }: { item: any }) => (
                  <OpenLoopCard
                    id={item.id}
                    title={item.title}
                    category={item.category}
                    onConvert={handleConvertLoop}
                    onArchive={handleArchiveLoop}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* ── Pluto ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing['3xl'],
            }}
            nestedScrollEnabled
          >
            <Card accentColor={colors.emphasis.primary}>
              <View style={{ alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.lg }}>
                <Text
                  style={{
                    fontSize: fontSize.lg,
                    fontWeight: '700',
                    color: colors.text.primary,
                  }}
                >
                  Need help? Ask Pluto.
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    color: colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  Pluto can help you process open loops, reflect on your journal, or just be a
                  sounding board.
                </Text>
                <Button
                  title="Open Pluto"
                  variant="primary"
                  size="lg"
                  accentColor={colors.emphasis.primary}
                  onPress={() => router.push('/(app)/pluto')}
                />
              </View>
            </Card>
          </ScrollView>

          {/* ── Journal ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              gap: spacing.md,
              paddingTop: spacing.md,
              paddingBottom: spacing['3xl'],
            }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <JournalCard
              type="morning"
              isCompleted={!!morningEntry}
              onPress={() => handleOpenJournal('morning')}
            />
            <JournalCard
              type="evening"
              isCompleted={!!eveningEntry}
              onPress={() => handleOpenJournal('evening')}
            />
          </ScrollView>
        </TabSwipePager>
      </KeyboardAvoidingView>

      {/* Sheets */}
      <GuideItemFormSheet
        ref={guideFormRef}
        editId={editGuideItem?.id}
        editData={
          editGuideItem
            ? {
                title: editGuideItem.title,
                category: editGuideItem.category,
                statement: editGuideItem.statement ?? undefined,
                meaning: editGuideItem.meaning ?? undefined,
                exampleApplication: editGuideItem.exampleApplication ?? undefined,
              }
            : null
        }
        defaultCategory={selectedGuideCategory}
        onDismiss={() => setEditGuideItem(null)}
      />

      <StrategyFormSheet
        ref={strategyFormRef}
        editId={editStrategy?.id}
        editData={
          editStrategy
            ? {
                title: editStrategy.title,
                category: editStrategy.category,
                triggerText: editStrategy.triggerText ?? undefined,
                contextText: editStrategy.contextText ?? undefined,
                responseStepsMarkdown: editStrategy.responseStepsMarkdown ?? undefined,
                whyItMatters: editStrategy.whyItMatters ?? undefined,
              }
            : null
        }
        defaultCategory={selectedStrategyCategory}
        onDismiss={() => setEditStrategy(null)}
      />

      <ConvertOpenLoopSheet
        ref={convertSheetRef}
        loopId={convertLoop?.id ?? null}
        loopTitle={convertLoop?.title ?? ''}
        onDismiss={() => setConvertLoop(null)}
      />

      <JournalFormSheet
        ref={journalSheetRef}
        journalType={journalType}
        date={today}
        existingData={
          journalType === 'morning'
            ? morningEntry
              ? (morningEntry as any).answersJson
                ? JSON.parse((morningEntry as any).answersJson)
                : null
              : null
            : eveningEntry
              ? (eveningEntry as any).answersJson
                ? JSON.parse((eveningEntry as any).answersJson)
                : null
              : null
        }
      />
    </SafeAreaView>
  );
}
