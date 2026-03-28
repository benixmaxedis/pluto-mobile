import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

// ── Types ────────────────────────────────────────────────

type ResultType = 'Action' | 'Routine' | 'Open Loop' | 'Guide Item' | 'Strategy';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
}

// ── Component ────────────────────────────────────────────

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const pattern = `%${trimmed}%`;

    try {
      const userId = await getCurrentUserId();
      const sb = getSupabase();

      const [
        { data: matchedActions },
        { data: matchedRoutines },
        { data: matchedOpenLoops },
        { data: matchedGuideItems },
        { data: matchedStrategies },
      ] = await Promise.all([
        sb
          .from('actions')
          .select('id, title, notes')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .ilike('title', pattern)
          .limit(10),
        sb
          .from('routine_templates')
          .select('id, title, category')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .ilike('title', pattern)
          .limit(10),
        sb
          .from('open_loops')
          .select('id, title, body')
          .eq('user_id', userId)
          .ilike('title', pattern)
          .limit(10),
        sb
          .from('guide_items')
          .select('id, title, category')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .ilike('title', pattern)
          .limit(10),
        sb
          .from('strategies')
          .select('id, title, category')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .ilike('title', pattern)
          .limit(10),
      ]);

      const all: SearchResult[] = [
        ...(matchedActions ?? []).map((r: { id: string; title: string; notes: string | null }) => ({
          id: r.id,
          type: 'Action' as ResultType,
          title: r.title,
          subtitle: r.notes ?? undefined,
        })),
        ...(matchedRoutines ?? []).map((r: { id: string; title: string; category: string }) => ({
          id: r.id,
          type: 'Routine' as ResultType,
          title: r.title,
          subtitle: r.category ?? undefined,
        })),
        ...(matchedOpenLoops ?? []).map((r: { id: string; title: string; body: string | null }) => ({
          id: r.id,
          type: 'Open Loop' as ResultType,
          title: r.title,
          subtitle: r.body ?? undefined,
        })),
        ...(matchedGuideItems ?? []).map((r: { id: string; title: string; category: string }) => ({
          id: r.id,
          type: 'Guide Item' as ResultType,
          title: r.title,
          subtitle: r.category ?? undefined,
        })),
        ...(matchedStrategies ?? []).map((r: { id: string; title: string; category: string }) => ({
          id: r.id,
          type: 'Strategy' as ResultType,
          title: r.title,
          subtitle: r.category ?? undefined,
        })),
      ];

      setResults(all);
    } catch (error) {
      console.error('[search] query failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      runSearch(text);
    },
    [runSearch],
  );

  // ── Rendering ──────────────────────────────────────────

  const accentForType = (type: ResultType): string => {
    switch (type) {
      case 'Action':
        return colors.actions.primary;
      case 'Routine':
        return colors.routines.primary;
      case 'Open Loop':
        return colors.capture.primary;
      case 'Guide Item':
        return colors.guide.primary;
      case 'Strategy':
        return colors.strategies.primary;
    }
  };

  const renderItem: ListRenderItem<SearchResult> = useCallback(
    ({ item }) => (
      <Pressable
        style={({ pressed }) => [styles.resultRow, pressed && styles.resultPressed]}
      >
        <View style={[styles.badge, { backgroundColor: accentForType(item.type) }]}>
          <Text style={styles.badgeText}>{item.type}</Text>
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
      </Pressable>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Search</Text>
        <TextInput
          style={styles.input}
          placeholder="Search actions, routines, guide items..."
          placeholderTextColor={colors.text.muted}
          value={query}
          onChangeText={handleChangeText}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {results.length === 0 && query.length >= 2 && !isSearching ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  resultPressed: {
    opacity: 0.7,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.background,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text.primary,
  },
  resultSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['3xl'],
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.text.muted,
  },
});
