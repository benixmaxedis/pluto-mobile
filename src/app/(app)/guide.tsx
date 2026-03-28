import { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import { useGuideItems } from '@/features/guide/hooks/useGuideItems';
import { useStrategies } from '@/features/guide/hooks/useStrategies';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { EmptyState, SegmentedControl, TabSwipePager } from '@/components/ui';
import { ScreenTabHeader } from '@/components/navigation/ScreenTabHeader';
import { GuideItemCard } from '@/components/cards/GuideItemCard';
import { StrategyCard } from '@/components/cards/StrategyCard';
import { GuideItemFormSheet, StrategyFormSheet } from '@/components/sheets';
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

  const guideFormRef = useRef<FormSheetRef>(null);
  const strategyFormRef = useRef<FormSheetRef>(null);
  const [editGuideItem, setEditGuideItem] = useState<any>(null);
  const [editStrategy, setEditStrategy] = useState<any>(null);

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

  const accentColor = selectedSection === 0 ? colors.guide.primary : colors.strategies.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenTabHeader title="Guide">
        <SegmentedControl
          segments={SECTIONS}
          selectedIndex={selectedSection}
          onSelect={setSelectedSection}
          accentColor={accentColor}
          selectionStyle="neutral"
        />
      </ScreenTabHeader>

      <TabSwipePager
        selectedIndex={selectedSection}
        onIndexChange={setSelectedSection}
        style={{ flex: 1 }}
      >
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
              const filteredGuideItems = guideItemsByCategoryIndex[catIdx] ?? [];
              return (
                <View key={cat} style={{ flex: 1 }} collapsable={false}>
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

          <Pressable
            onPress={handleCreateGuideItem}
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
              const filteredStrategies = strategiesByCategoryIndex[catIdx] ?? [];
              return (
                <View key={cat} style={{ flex: 1 }} collapsable={false}>
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

          <Pressable
            onPress={handleCreateStrategy}
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
      </TabSwipePager>

      {/* Guide Item Form Sheet */}
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

      {/* Strategy Form Sheet */}
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
    </SafeAreaView>
  );
}
