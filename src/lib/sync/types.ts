export interface SyncConfig {
  apiBaseUrl: string;
  batchSize: number;
  debounceMs: number;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}
