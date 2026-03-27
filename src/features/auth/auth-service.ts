import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';

/**
 * Retrieve the stored access token, or null if none exists.
 */
export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist access (and optionally refresh) tokens in secure storage.
 */
export async function storeTokens(
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  }
}

/**
 * Remove all stored tokens (sign-out).
 */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

/**
 * Attempt to restore an authenticated session from stored tokens.
 *
 * For v1 this simply checks whether a token exists. When a real API is
 * wired up, this should validate the token and return the decoded user.
 */
export async function restoreAuth(): Promise<{ userId: string } | null> {
  const token = await getStoredToken();
  if (!token) {
    return null;
  }

  // TODO: validate token with backend / decode JWT
  // For now, derive a placeholder userId from the stored token.
  return { userId: token };
}
