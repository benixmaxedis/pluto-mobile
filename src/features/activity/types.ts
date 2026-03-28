export type ActivityEvent = {
  id: string;
  userId: string | null;
  eventType: string;
  entityType: string;
  entityId: string;
  eventDate: string | null;
  eventSession: string | null;
  payloadJson: string | null;
  createdAt: string;
  syncStatus: string | null;
};
