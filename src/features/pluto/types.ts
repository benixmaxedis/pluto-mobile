export type ChatMessage = {
  id: string;
  userId: string | null;
  role: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
