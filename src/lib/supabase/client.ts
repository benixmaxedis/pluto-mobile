import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

function getExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  const v = extra?.[key];
  return typeof v === 'string' ? v.trim() || undefined : undefined;
}

function normalizeSupabaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

function normalizeKey(raw: string): string {
  return raw.trim();
}

let client: SupabaseClient | null = null;

/**
 * Public client key: publishable (`sb_publishable_…`) or legacy anon JWT.
 * @see https://github.com/orgs/supabase/discussions/29260
 */
function resolvePublicSupabaseKey(): string | undefined {
  const fromEnv =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const raw = fromEnv ?? getExtra('supabasePublishableKey') ?? getExtra('supabaseAnonKey');
  return raw ? normalizeKey(raw) : undefined;
}

/** Postgres + REST only; Supabase Auth (GoTrue) is not used. */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const urlRaw = process.env.EXPO_PUBLIC_SUPABASE_URL ?? getExtra('supabaseUrl');
  const url = urlRaw ? normalizeSupabaseUrl(urlRaw) : '';
  const publicKey = resolvePublicSupabaseKey();
  if (!url || !publicKey) {
    throw new Error(
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy EXPO_PUBLIC_SUPABASE_ANON_KEY). Optional: app.json extra.supabaseUrl / supabasePublishableKey or supabaseAnonKey.',
    );
  }
  client = createClient(url, publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
