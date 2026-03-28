import * as SecureStore from 'expo-secure-store';
import { generateId } from '@/lib/utils/id';

const STORAGE_KEY = 'pluto_device_user_id';

export async function getDeviceUserId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function getOrCreateDeviceUserId(): Promise<string> {
  let id = await getDeviceUserId();
  if (!id) {
    id = generateId();
    await SecureStore.setItemAsync(STORAGE_KEY, id);
  }
  return id;
}

export async function clearDeviceUserId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch {
    /* no key */
  }
}
