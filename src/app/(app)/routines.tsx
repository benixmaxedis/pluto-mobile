import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { SegmentedControl, EmptyState, TabSwipePager } from '@/components/ui';
import { RoutineCard } from '@/components/cards/RoutineCard';
import { RoutineFormSheet } from '@/components/sheets';
import { useRoutineTemplates } from '@/features/routines/hooks/useRoutines';
import { LifeCategory } from '@/lib/constants';
import type { RecurrenceType, Session } from '@/lib/constants';

const CATEGORY_TABS = [
  'All',
  'Sleep',
  'Health',
  'Home',
  'Work',
  'Finance',
  'Self Care',
  'Social',
  'Learning',
  'Family',
  'Other',
];

const CATEGORY_VALUES: (string | null)[] = [
  null, // "All"
  LifeCategory.SLEEP,
  LifeCategory.HEALTH,
  LifeCategory.HOME,
  LifeCategory.WORK,
  LifeCategory.FINANCE,
  LifeCategory.SELF_CARE,
  LifeCategory.SOCIAL,
  LifeCategory.LEARNING,
  LifeCategory.FAMILY,
  LifeCategory.OTHER,
];

interface TemplateRow {
  id: string;
  title: string;
  notes: string | null;
  category: string;
  defaultSession: string | null;
  recurrenceType: string;
  recurrenceDaysJson: string | null;
  isActive: boolean | null;
  deletedAt: string | null;
}

export default function RoutinesScreen() {
  const [selectedTab, setSelectedTab] = useState(0); // Default to "All"
  const { data: templates } = useRoutineTemplates();
  const [routineSheetOpen, setRoutineSheetOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<TemplateRow | null>(null);

  const filteredByCategoryTab = useMemo(() => {
    if (!templates) return CATEGORY_TABS.map(() => [] as TemplateRow[]);
    const rows = templates as TemplateRow[];
    return CATEGORY_TABS.map((_, i) => {
      const categoryFilter = CATEGORY_VALUES[i];
      if (categoryFilter === null) {
        return rows.filter((t) => !t.deletedAt);
      }
      return rows.filter((t) => !t.deletedAt && t.category === categoryFilter);
    });
  }, [templates]);

  const handleCreateRoutine = useCallback(() => {
    setEditTemplate(null);
    setRoutineSheetOpen(true);
  }, []);

  const handleEditRoutine = useCallback((item: TemplateRow) => {
    setEditTemplate(item);
    setRoutineSheetOpen(true);
  }, []);

  const handleRoutineSheetDismiss = useCallback(() => {
    setRoutineSheetOpen(false);
    setEditTemplate(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TemplateRow }) => (
      <Pressable
        onPress={() => handleEditRoutine(item)}
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}
      >
        <RoutineCard
          id={item.id}
          title={item.title}
          category={item.category}
          defaultSession={item.defaultSession as Session | null}
          recurrenceType={item.recurrenceType as RecurrenceType}
          recurrenceDaysJson={item.recurrenceDaysJson}
          isActive={item.isActive ?? true}
        />
      </Pressable>
    ),
    [handleEditRoutine],
  );

  const emptyMessageForTab = (tabIdx: number) => {
    const selectedCategory = CATEGORY_VALUES[tabIdx];
    return selectedCategory === null
      ? 'No routines yet. Build your rhythm here.'
      : `No ${CATEGORY_TABS[tabIdx].toLowerCase()} routines yet.`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.text.primary,
          }}
        >
          Routines
        </Text>
      </View>

      {/* Category tabs */}
      <View style={{ paddingBottom: spacing.md }}>
        <SegmentedControl
          segments={CATEGORY_TABS}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
          accentColor={colors.routines.primary}
          scrollable
        />
      </View>

      <TabSwipePager selectedIndex={selectedTab} onIndexChange={setSelectedTab} style={{ flex: 1 }}>
        {CATEGORY_TABS.map((_, tabIdx) => {
          const filteredTemplates = filteredByCategoryTab[tabIdx] ?? [];
          return (
            <View key={CATEGORY_TABS[tabIdx]} style={{ flex: 1 }} collapsable={false}>
              <FlatList
                data={filteredTemplates}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                nestedScrollEnabled
                contentContainerStyle={{
                  paddingBottom: spacing['3xl'] + 60,
                  ...(filteredTemplates.length === 0 ? { flex: 1, justifyContent: 'center' as const } : {}),
                }}
                ListEmptyComponent={
                  <View style={{ paddingHorizontal: spacing.lg }}>
                    <EmptyState
                      message={emptyMessageForTab(tabIdx)}
                      accentColor={colors.routines.primary}
                    />
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            </View>
          );
        })}
      </TabSwipePager>

      {/* FAB */}
      <Pressable
        onPress={handleCreateRoutine}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: spacing['2xl'],
          right: spacing.lg,
          width: 56,
          height: 56,
          borderRadius: borderRadius.full,
          backgroundColor: colors.routines.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
          elevation: 6,
          shadowColor: colors.routines.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        })}
      >
        <Text style={{ fontSize: fontSize['2xl'], color: colors.background, fontWeight: '300', marginTop: -2 }}>
          +
        </Text>
      </Pressable>

      {/* Form Sheet */}
      <RoutineFormSheet
        visible={routineSheetOpen}
        onDismiss={handleRoutineSheetDismiss}
        editId={editTemplate?.id}
        editData={
          editTemplate
            ? {
                title: editTemplate.title,
                notes: editTemplate.notes ?? undefined,
                category: editTemplate.category as any,
                defaultSession: editTemplate.defaultSession as any,
                recurrenceType: editTemplate.recurrenceType as any,
                recurrenceDaysJson: editTemplate.recurrenceDaysJson ?? undefined,
              }
            : null
        }
      />
    </SafeAreaView>
  );
}
