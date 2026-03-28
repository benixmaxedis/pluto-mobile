import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as journalQueries from '../db/journal-queries';

export function useJournalEntry(date: string, type: 'morning' | 'evening') {
  return useQuery({
    queryKey: queryKeys.journal.byDateAndType(date, type),
    queryFn: () => journalQueries.getJournalEntry(date, type),
  });
}

export function useJournalEntriesByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.journal.byDate(date),
    queryFn: () => journalQueries.getJournalEntriesByDate(date),
  });
}

export function useSaveJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      date,
      type,
      answers,
    }: {
      date: string;
      type: 'morning' | 'evening';
      answers: Record<string, unknown>;
    }) => journalQueries.upsertJournalEntry(date, type, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityEvents.all });
    },
  });
}
