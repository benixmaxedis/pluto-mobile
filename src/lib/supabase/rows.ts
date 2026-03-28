/** Map Postgres snake_case keys to the camelCase shape the UI expects. */
export function camelRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
    out[camel] = v;
  }
  return out;
}

export function camelRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => camelRow(r));
}

/** Map a shallow camelCase object to snake_case for inserts/updates. */
export function snakeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const snake = k.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    out[snake] = v;
  }
  return out;
}
