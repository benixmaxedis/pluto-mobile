export type MomentumChain = {
  id: string;
  userId: string | null;
  name: string;
  domain: string;
  description: string | null;
  isActive: boolean | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
  deletedAt: string | null;
};

export type MomentumChainStep = {
  id: string;
  chainId: string;
  title: string;
  notes: string | null;
  defaultSession: string | null;
  leadOffsetSessions: number | null;
  stepType: string | null;
  orderIndex: number;
  isOptional: boolean | null;
  createdAt: string;
  updatedAt: string;
};
