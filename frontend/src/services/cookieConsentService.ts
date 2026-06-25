/**
 * Serviço para gerenciar consentimento de cookies
 * Usa localStorage como source of truth e sincroniza com cookies HTTP-only do backend
 */

import Cookies from 'js-cookie';
import type {
  CookieConsent,
  CookieConsentState,
  CookieConsentKey,
} from '../types/cookies';
import {
  DEFAULT_COOKIE_CONSENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_COOKIE_NAME,
} from '../types/cookies';

/**
 * Obtém o consentimento de cookies do localStorage
 */
export function getCookieConsent(): CookieConsentState {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!stored) {
      return {
        ...DEFAULT_COOKIE_CONSENT,
        isLoaded: false,
        lastUpdated: 0,
      };
    }

    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_COOKIE_CONSENT,
      ...parsed,
      isLoaded: true,
      essential: true, // Essential nunca pode ser false
    };
  } catch (error) {
    console.error('❌ Erro ao ler consentimento de cookies:', error);
    return {
      ...DEFAULT_COOKIE_CONSENT,
      isLoaded: false,
      lastUpdated: 0,
    };
  }
}

/**
 * Salva o consentimento de cookies no localStorage
 * e sincroniza com o backend via documento
 */
export function setCookieConsent(consent: CookieConsent): void {
  try {
    const consentState: CookieConsentState = {
      ...consent,
      essential: true, // Sempre true
      isLoaded: true,
      lastUpdated: Date.now(),
    };

    // Salva no localStorage
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consentState));

    // Dispara evento customizado para notificar outros componentes
    window.dispatchEvent(
      new CustomEvent('cookieConsentChanged', {
        detail: consentState,
      })
    );

    // Sincroniza com cookie public (para o backend poder ler se necessário)
    // Nota: O consentimento real fica no localStorage (client-side)
    // O cookie é apenas para referência
    Cookies.set(COOKIE_CONSENT_COOKIE_NAME, JSON.stringify(consentState), {
      expires: 365,
      sameSite: 'strict',
      secure: window.location.protocol === 'https:', // HTTPS only em produção
    });

    console.log('✅ Consentimento de cookies atualizado:', consentState);
  } catch (error) {
    console.error('❌ Erro ao salvar consentimento de cookies:', error);
  }
}

/**
 * Obtém o consentimento específico (analytics, marketing, etc)
 */
export function getConsentFor(key: CookieConsentKey): boolean {
  const consent = getCookieConsent();
  return consent[key] ?? false;
}

/**
 * Atualiza um consentimento específico
 */
export function updateConsentFor(key: CookieConsentKey, value: boolean): void {
  const current = getCookieConsent();
  const updated: CookieConsent = {
    ...current,
    [key]: value,
  };
  setCookieConsent(updated);
}

/**
 * Limpa todos os consentimentos (exceto essential)
 */
export function clearCookieConsent(): void {
  setCookieConsent({
    ...DEFAULT_COOKIE_CONSENT,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  Cookies.remove(COOKIE_CONSENT_COOKIE_NAME);
}

/**
 * Listener para mudanças de consentimento
 */
export function onCookieConsentChanged(
  callback: (consent: CookieConsentState) => void
): () => void {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener('cookieConsentChanged', handler);

  // Retorna função para unsubscribe
  return () => {
    window.removeEventListener('cookieConsentChanged', handler);
  };
}
