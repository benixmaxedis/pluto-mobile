import { clearDeviceUserId, getDeviceUserId, getOrCreateDeviceUserId } from '@/lib/identity/device-user-id';

/** Stable per-install user id for `user_id` columns (no Supabase Auth). */
export async function getCurrentUserId(): Promise<string> {
  return getOrCreateDeviceUserId();
}

export async function getOptionalUserId(): Promise<string | null> {
  return getDeviceUserId();
}

export { clearDeviceUserId };
