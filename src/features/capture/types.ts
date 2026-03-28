export type OpenLoop = {
  id: string;
  userId: string | null;
  category: string | null;
  title: string;
  body: string | null;
  status: string | null;
  convertedToType: string | null;
  convertedToId: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
};

export type JournalEntry = {
  id: string;
  userId: string | null;
  entryDate: string;
  journalType: string;
  session: string | null;
  answersJson: string | null;
  summaryText: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
};
