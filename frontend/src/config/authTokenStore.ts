let currentAuthToken: string | null = null;

export function setCurrentAuthToken(token: string | null): void {
  currentAuthToken = token ? token.replace(/^Bearer\s+/i, '').trim() : null;
}

export function getCurrentAuthToken(): string | null {
  return currentAuthToken;
}

export function clearCurrentAuthToken(): void {
  currentAuthToken = null;
}
