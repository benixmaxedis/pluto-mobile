import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { SegmentedControl, EmptyState } from '@/components/ui';
import { RoutineCard } from '@/components/cards/RoutineCard';
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
  category: string;
  defaultSession: string | null;
  recurrenceType: string;
  recurrenceDaysJson: string | null;
  isActive: boolean | null;
  deletedAt: string | null;
}

export default function RoutinesScreen() {
  const [selectedTab, setSelectedTab] = useState(0); // Default to "All"
  const { data: templates, isLoading } = useRoutineTemplates();

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    const rows = templates as TemplateRow[];
    const categoryFilter = CATEGORY_VALUES[selectedTab];

    if (categoryFilter === null) {
      // "All" tab - show everything
      return rows.filter((t) => !t.deletedAt);
    }

    return rows.filter((t) => !t.deletedAt && t.category === categoryFilter);
  }, [templates, selectedTab]);

  const handleCreateRoutine = useCallback(() => {
    console.log('Create routine pressed');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TemplateRow }) => (
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <RoutineCard
          id={item.id}
          title={item.title}
          category={item.category}
          defaultSession={item.defaultSession as Session | null}
          recurrenceType={item.recurrenceType as RecurrenceType}
          recurrenceDaysJson={item.recurrenceDaysJson}
          isActive={item.isActive ?? true}
        />
      </View>
    ),
    [],
  );

  const selectedCategory = CATEGORY_VALUES[selectedTab];
  const emptyMessage =
    selectedCategory === null
      ? 'No routines yet. Build your rhythm here.'
      : `No ${CATEGORY_TABS[selectedTab].toLowerCase()} routines yet.`;

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

      {/* Routines list */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: spacing['3xl'] + 60,
          ...(filteredTemplates.length === 0 ? { flex: 1, justifyContent: 'center' as const } : {}),
        }}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: spacing.lg }}>
            <EmptyState
              message={emptyMessage}
              accentColor={colors.routines.primary}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

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
    </SafeAreaView>
  );
}
