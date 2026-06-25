"use client"; // Obrigatório no Next.js para hooks que usam hooks de navegação e useEffect

/**
 * Custom Hook para gerenciar Google Analytics 4
 * Inicializa GA4 apenas se o usuário consentiu com analytics
 * Rastreia automaticamente mudanças de página
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation'; // Importação do Next correta
import ReactGA from 'react-ga4';
import { getCookieConsent, onCookieConsentChanged } from '../../services/cookieConsentService';
import type { CookieConsentState } from '../../types/cookies';

const GA4_MEASUREMENT_ID = 'G-VHWTKLWPRR';

interface UseAnalyticsOptions {
  /** Registrar pageview automaticamente em mudanças de rota */
  trackPageViews?: boolean;
  /** Debug mode - mostra logs do GA4 */
  debug?: boolean;
}

const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const { trackPageViews = true, debug = false } = options;
  
  // CORREÇÃO: Removido o useLocation() antigo e usando o pathname direto
  const pathname = usePathname(); 
  
  const isInitializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Inicializa GA4
   */
  const initializeGA4 = useCallback(() => {
    try {
      if (isInitializedRef.current) {
        console.log('⚠️  GA4 já foi inicializado');
        return;
      }

      ReactGA.initialize(GA4_MEASUREMENT_ID, {
        gaOptions: {
          siteSpeedSampleRate: 100,
        },
      });

      isInitializedRef.current = true;
      console.log('✅ GA4 inicializado com sucesso');

      // Envia pageview inicial
      if (trackPageViews) {
        ReactGA.send({
          hitType: 'pageview',
          page: pathname,
          title: document.title,
        });
        console.log('📊 Pageview inicial enviado:', pathname);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar GA4:', error);
    }
  }, [trackPageViews, pathname]);

  /**
   * Desabilita GA4 (quando usuário revoga consentimento)
   */
  const disableGA4 = useCallback(() => {
    try {
      // Remove todas as cookies do Google Analytics
      const cookies = document.cookie.split(';');
      cookies.forEach((cookie) => {
        const [name] = cookie.split('=');
        const trimmedName = name.trim();
        if (trimmedName.startsWith('_ga') || trimmedName.startsWith('_gat')) {
          document.cookie = `${trimmedName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        }
      });

      isInitializedRef.current = false;
      console.log('🚫 GA4 desabilitado - Cookies removidas');
    } catch (error) {
      console.error('❌ Erro ao desabilitar GA4:', error);
    }
  }, []);

  /**
   * Rastreia pageview quando a rota muda
   */
  const trackPageView = useCallback(() => {
    if (!isInitializedRef.current || !trackPageViews) {
      return;
    }

    try {
      ReactGA.send({
        hitType: 'pageview',
        page: pathname,
        title: document.title,
      });

      if (debug) {
        console.log('📊 Pageview enviado:', pathname);
      }
    } catch (error) {
      console.error('❌ Erro ao rastrear pageview:', error);
    }
  }, [pathname, trackPageViews, debug]);

  /**
   * Rastreia eventos customizados
   */
  const trackEvent = useCallback(
    (eventName: string, eventData?: Record<string, string | number>) => {
      if (!isInitializedRef.current) {
        console.warn('⚠️  GA4 não está inicializado - evento não rastreado');
        return;
      }

      try {
        ReactGA.event(eventName, eventData);

        if (debug) {
          console.log('📊 Evento rastreado:', eventName, eventData);
        }
      } catch (error) {
        console.error('❌ Erro ao rastrear evento:', error);
      }
    },
    [debug]
  );

  /**
   * Gerencia listener de mudanças de consentimento
   */
  useEffect(() => {
    const handleConsentChange = (consent: CookieConsentState) => {
      if (consent.analytics && !isInitializedRef.current) {
        console.log('✅ Usuário aceitou analytics - inicializando GA4');
        initializeGA4();
      } else if (!consent.analytics && isInitializedRef.current) {
        console.log('🚫 Usuário revogou analytics - desabilitando GA4');
        disableGA4();
      }
    };

    // Subscribe para mudanças de consentimento
    unsubscribeRef.current = onCookieConsentChanged(handleConsentChange);

    // Verifica consentimento inicial
    const initialConsent = getCookieConsent();
    if (initialConsent && initialConsent.analytics) {
      initializeGA4();
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [initializeGA4, disableGA4]);

  /**
   * Rastreia mudanças de página
   */
  useEffect(() => {
    trackPageView();
  }, [pathname, trackPageView]);

  return {
    isInitialized: isInitializedRef.current,
    trackEvent,
    trackPageView,
  };
};

export default useAnalytics;
export type { UseAnalyticsOptions };