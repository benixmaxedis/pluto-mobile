export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
