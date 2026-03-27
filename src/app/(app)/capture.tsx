import { useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOpenLoops, useCreateOpenLoop, useArchiveOpenLoop } from '@/features/capture/hooks/useOpenLoops';
import { useJournalEntriesByDate } from '@/features/capture/hooks/useJournal';
import { toISODate } from '@/lib/utils/date';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { Card, EmptyState, SegmentedControl, TextInput, Button, Badge } from '@/components/ui';
import { OpenLoopCard } from '@/components/cards/OpenLoopCard';
import { JournalCard } from '@/components/cards/JournalCard';

const SEGMENTS = ['Open Loops', 'Journal', 'Pluto'];

export default function CaptureScreen() {
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [inputText, setInputText] = useState('');
  const router = useRouter();

  const today = useMemo(() => toISODate(new Date()), []);

  const { data: openLoops, isLoading: loopsLoading } = useOpenLoops();
  const createOpenLoop = useCreateOpenLoop();
  const archiveOpenLoop = useArchiveOpenLoop();
  const { data: journalEntries } = useJournalEntriesByDate(today);

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

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    createOpenLoop.mutate({ title: trimmed });
    setInputText('');
  };

  const handleArchive = (id: string) => {
    archiveOpenLoop.mutate(id);
  };

  const handleConvert = (_id: string) => {
    // Placeholder -- navigate to convert flow in a future iteration
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}
          >
            Capture
          </Text>
          <SegmentedControl
            segments={SEGMENTS}
            selectedIndex={selectedSegment}
            onSelect={setSelectedSegment}
            accentColor={colors.capture.primary}
          />
        </View>

        {/* ── Open Loops ─────────────────────────────────────── */}
        {selectedSegment === 0 && (
          <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.sm,
                marginBottom: spacing.md,
                marginTop: spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Capture a thought..."
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                  autoFocus
                />
              </View>
              <Button
                title="Add"
                variant="primary"
                size="md"
                accentColor={colors.capture.primary}
                onPress={handleSubmit}
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
                contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing['3xl'] }}
                renderItem={({ item }: { item: any }) => (
                  <OpenLoopCard
                    id={item.id}
                    title={item.title}
                    category={item.category}
                    onConvert={handleConvert}
                    onArchive={handleArchive}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {/* ── Journal ────────────────────────────────────────── */}
        {selectedSegment === 1 && (
          <View style={{ flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.md }}>
            <JournalCard
              type="morning"
              isCompleted={!!morningEntry}
              onPress={() => {
                // Placeholder navigation
              }}
            />
            <JournalCard
              type="evening"
              isCompleted={!!eveningEntry}
              onPress={() => {
                // Placeholder navigation
              }}
            />
          </View>
        )}

        {/* ── Pluto ──────────────────────────────────────────── */}
        {selectedSegment === 2 && (
          <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            <Card accentColor={colors.capture.primary}>
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
                  accentColor={colors.capture.primary}
                  onPress={() => router.push('/(app)/pluto')}
                />
              </View>
            </Card>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
