import { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGuideItems } from '@/features/guide/hooks/useGuideItems';
import { useStrategies } from '@/features/guide/hooks/useStrategies';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { Card, EmptyState, SegmentedControl, Badge, Button } from '@/components/ui';
import { GuideItemCard } from '@/components/cards/GuideItemCard';
import { StrategyCard } from '@/components/cards/StrategyCard';
import { GuideCategory, LifeCategory } from '@/lib/constants';

const SECTIONS = ['Code', 'Strategies'];

const GUIDE_CATEGORIES = Object.values(GuideCategory);
const GUIDE_CATEGORY_LABELS = GUIDE_CATEGORIES.map(
  (c) => c.charAt(0).toUpperCase() + c.slice(1),
);

const STRATEGY_CATEGORIES = Object.values(LifeCategory);
const STRATEGY_CATEGORY_LABELS = STRATEGY_CATEGORIES.map(
  (c) =>
    c
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
);

export default function GuideScreen() {
  const [selectedSection, setSelectedSection] = useState(0);
  const [guideCategoryIndex, setGuideCategoryIndex] = useState(0);
  const [strategyCategoryIndex, setStrategyCategoryIndex] = useState(0);

  const { data: allGuideItems, isLoading: guideLoading } = useGuideItems();
  const { data: allStrategies, isLoading: strategiesLoading } = useStrategies();

  const selectedGuideCategory = GUIDE_CATEGORIES[guideCategoryIndex];
  const selectedStrategyCategory = STRATEGY_CATEGORIES[strategyCategoryIndex];

  const filteredGuideItems = useMemo(
    () =>
      (allGuideItems ?? []).filter(
        (item: any) => item.category === selectedGuideCategory && !item.deletedAt,
      ),
    [allGuideItems, selectedGuideCategory],
  );

  const filteredStrategies = useMemo(
    () =>
      (allStrategies ?? []).filter(
        (item: any) => item.category === selectedStrategyCategory && !item.deletedAt,
      ),
    [allStrategies, selectedStrategyCategory],
  );

  const accentColor = selectedSection === 0 ? colors.guide.primary : colors.strategies.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}
        >
          Guide
        </Text>
        <SegmentedControl
          segments={SECTIONS}
          selectedIndex={selectedSection}
          onSelect={setSelectedSection}
          accentColor={accentColor}
        />
      </View>

      {/* ── Code section ───────────────────────────────────── */}
      {selectedSection === 0 && (
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
            <SegmentedControl
              segments={GUIDE_CATEGORY_LABELS}
              selectedIndex={guideCategoryIndex}
              onSelect={setGuideCategoryIndex}
              accentColor={colors.guide.primary}
              scrollable
            />
          </View>

          {filteredGuideItems.length === 0 && !guideLoading ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EmptyState
                message="Your personal code lives here."
                accentColor={colors.guide.primary}
              />
            </View>
          ) : (
            <FlatList
              data={filteredGuideItems}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={{
                gap: spacing.sm,
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing['3xl'] + 60,
              }}
              renderItem={({ item }: { item: any }) => (
                <GuideItemCard
                  id={item.id}
                  title={item.title}
                  statement={item.statement}
                  category={item.category}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* FAB */}
          <Pressable
            onPress={() => {
              // Placeholder -- open create guide item form
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              bottom: spacing.xl,
              right: spacing.xl,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.guide.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              elevation: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            })}
          >
            <Text style={{ fontSize: fontSize['2xl'], color: colors.background, fontWeight: '700' }}>
              +
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Strategies section ─────────────────────────────── */}
      {selectedSection === 1 && (
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
            <SegmentedControl
              segments={STRATEGY_CATEGORY_LABELS}
              selectedIndex={strategyCategoryIndex}
              onSelect={setStrategyCategoryIndex}
              accentColor={colors.strategies.primary}
              scrollable
            />
          </View>

          {filteredStrategies.length === 0 && !strategiesLoading ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EmptyState
                message="Strategies are your playbooks for tough situations."
                accentColor={colors.strategies.primary}
              />
            </View>
          ) : (
            <FlatList
              data={filteredStrategies}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={{
                gap: spacing.sm,
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing['3xl'] + 60,
              }}
              renderItem={({ item }: { item: any }) => (
                <StrategyCard
                  id={item.id}
                  title={item.title}
                  triggerText={item.triggerText}
                  category={item.category}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* FAB */}
          <Pressable
            onPress={() => {
              // Placeholder -- open create strategy form
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              bottom: spacing.xl,
              right: spacing.xl,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.strategies.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              elevation: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            })}
          >
            <Text style={{ fontSize: fontSize['2xl'], color: colors.background, fontWeight: '700' }}>
              +
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
