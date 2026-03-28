import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as activityQueries from '../db/activity-queries';

export function useActivityEventsByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.activityEvents.byDate(date),
    queryFn: () => activityQueries.getEventsByDate(date),
  });
}

export function useActivityEventsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.activityEvents.all, 'range', startDate, endDate],
    queryFn: () => activityQueries.getEventsByDateRange(startDate, endDate),
  });
}
