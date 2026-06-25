/**
 * Tipos para gerenciamento de consentimento de cookies
 */

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  essential: boolean; // Sempre true, não pode ser desativado
}

export interface CookieConsentState extends CookieConsent {
  isLoaded: boolean;
  lastUpdated: number; // timestamp
}

export type CookieConsentKey = keyof CookieConsent;

export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  analytics: false,
  marketing: false,
  preferences: false,
  essential: true,
};

export const COOKIE_CONSENT_STORAGE_KEY = 'PersonIA_CookieConsent';
export const COOKIE_CONSENT_COOKIE_NAME = 'consent_preferences';
