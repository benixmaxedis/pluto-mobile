import { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import { useOpenLoops, useCreateOpenLoop, useArchiveOpenLoop } from '@/features/capture/hooks/useOpenLoops';
import { useJournalEntriesByDate } from '@/features/capture/hooks/useJournal';
import { toISODate } from '@/lib/utils/date';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { Card, EmptyState, SegmentedControl, TextInput, Button, TabSwipePager } from '@/components/ui';
import { OpenLoopCard } from '@/components/cards/OpenLoopCard';
import { JournalCard } from '@/components/cards/JournalCard';
import { ConvertOpenLoopSheet, JournalFormSheet } from '@/components/sheets';

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

  // Bottom sheet refs
  const convertSheetRef = useRef<FormSheetRef>(null);
  const journalSheetRef = useRef<FormSheetRef>(null);
  const [convertLoop, setConvertLoop] = useState<{ id: string; title: string } | null>(null);
  const [journalType, setJournalType] = useState<'morning' | 'evening'>('morning');

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

  const handleConvert = useCallback((id: string) => {
    const loop = (openLoops ?? []).find((l: any) => l.id === id) as any;
    if (loop) {
      setConvertLoop({ id: loop.id, title: loop.title });
      convertSheetRef.current?.present();
    }
  }, [openLoops]);

  const handleOpenJournal = useCallback((type: 'morning' | 'evening') => {
    setJournalType(type);
    journalSheetRef.current?.present();
  }, []);

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

        <TabSwipePager
          selectedIndex={selectedSegment}
          onIndexChange={setSelectedSegment}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, paddingHorizontal: spacing.lg }} collapsable={false}>
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
                  autoFocus={selectedSegment === 0}
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
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing['3xl'],
            }}
            nestedScrollEnabled
          >
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
          </ScrollView>
        </TabSwipePager>
      </KeyboardAvoidingView>

      {/* Convert Open Loop Sheet */}
      <ConvertOpenLoopSheet
        ref={convertSheetRef}
        loopId={convertLoop?.id ?? null}
        loopTitle={convertLoop?.title ?? ''}
        onDismiss={() => setConvertLoop(null)}
      />

      {/* Journal Form Sheet */}
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
