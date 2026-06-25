"use client";

import React, { useState, useEffect } from 'react';
import {
  getCookieConsent,
  setCookieConsent,
  onCookieConsentChanged,
} from '../../../services/cookieConsentService';
import type { CookieConsent, CookieConsentState } from '../../../types/cookies';
import styles from './CookieBanner.module.css';

interface CookieBannerProps {
  autoShow?: boolean;
  position?: 'bottom' | 'top';
}

const CookieBanner: React.FC<CookieBannerProps> = ({ autoShow = true, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    analytics: false,
    marketing: false,
    preferences: false,
    essential: true,
  });

  useEffect(() => {
    const current = getCookieConsent();
    if (autoShow && !current.isLoaded) {
      setIsVisible(true);
    }
    setConsent({
      analytics: current.analytics,
      marketing: current.marketing,
      preferences: current.preferences,
      essential: true,
    });
  }, [autoShow]);

  useEffect(() => {
    const unsubscribe = onCookieConsentChanged((updatedConsent: CookieConsentState) => {
      setConsent({
        analytics: updatedConsent.analytics,
        marketing: updatedConsent.marketing,
        preferences: updatedConsent.preferences,
        essential: true,
      });
    });
    return () => unsubscribe();
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent({ analytics: true, marketing: true, preferences: true, essential: true });
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    setCookieConsent({ analytics: false, marketing: false, preferences: false, essential: true });
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(consent);
    setIsVisible(false);
    setShowDetails(false);
  };

  const handleToggle = (key: keyof CookieConsent) => {
    if (key === 'essential') return;
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Se não estiver visível, retorna null
  if (!isVisible) return null;

  return (
    <div className={`${styles.cookieBanner} ${styles[position]}`} role="dialog" aria-label="Cookie consent dialog">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Preferências de Cookies</h2>
          <button
            className={styles.closeButton}
            onClick={() => {
              setIsVisible(false);
              setShowDetails(false);
            }}
            aria-label="Fechar banner de cookies"
          >
            ✕
          </button>
        </div>

        {!showDetails ? (
          <div className={styles.basicView}>
            <p className={styles.description}>
              Utilizamos cookies para melhorar sua experiência. Alguns são essenciais para o
              funcionamento do site, enquanto outros nos ajudam a entender como você o utiliza.
            </p>

            <div className={styles.buttonGroup}>
              <button className={styles.buttonReject} onClick={handleRejectAll}>
                Rejeitar Tudo
              </button>
              <button className={styles.buttonDetails} onClick={() => setShowDetails(true)}>
                Ver Detalhes
              </button>
              <button className={styles.buttonAccept} onClick={handleAcceptAll}>
                Aceitar Tudo
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.detailedView}>
            <div className={styles.cookieList}>
              {/* Essenciais */}
              <div className={styles.cookieItem}>
                <div className={styles.cookieHeader}>
                  <label className={styles.cookieLabel}>
                    <input type="checkbox" checked={true} disabled aria-label="Cookies essenciais" />
                    <span className={styles.cookieName}>Essenciais</span>
                    <span className={styles.cookieBadge}>Obrigatório</span>
                  </label>
                </div>
                <p className={styles.cookieDescription}>
                  Necessários para o funcionamento básico do site, segurança e autenticação. Não podem ser desabilitados.
                </p>
              </div>

              {/* Analytics */}
              <div className={styles.cookieItem}>
                <div className={styles.cookieHeader}>
                  <label className={styles.cookieLabel}>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={() => handleToggle('analytics')}
                      aria-label="Cookies de analytics"
                    />
                    <span className={styles.cookieName}>Analytics</span>
                    <span className={styles.cookieBadge}>Opcional</span>
                  </label>
                </div>
                <p className={styles.cookieDescription}>
                  Nos ajuda a entender como você utiliza o site de forma anônima e agregada.
                </p>
              </div>

              {/* Marketing */}
              <div className={styles.cookieItem}>
                <div className={styles.cookieHeader}>
                  <label className={styles.cookieLabel}>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={() => handleToggle('marketing')}
                      aria-label="Cookies de marketing"
                    />
                    <span className={styles.cookieName}>Marketing</span>
                    <span className={styles.cookieBadge}>Opcional</span>
                  </label>
                </div>
                <p className={styles.cookieDescription}>
                  Utilizados para acompanhar a relevância de interações e anúncios.
                </p>
              </div>

              {/* Preferências */}
              <div className={styles.cookieItem}>
                <div className={styles.cookieHeader}>
                  <label className={styles.cookieLabel}>
                    <input
                      type="checkbox"
                      checked={consent.preferences}
                      onChange={() => handleToggle('preferences')}
                      aria-label="Cookies de preferências"
                    />
                    <span className={styles.cookieName}>Preferências</span>
                    <span className={styles.cookieBadge}>Opcional</span>
                  </label>
                </div>
                <p className={styles.cookieDescription}>
                  Lembram suas preferências customizadas (como tema e idioma) para as próximas sessões.
                </p>
              </div>
            </div>

            <div className={styles.detailsButtonGroup}>
              <button className={styles.buttonReject} onClick={handleRejectAll}>
                Rejeitar Tudo
              </button>
              <button className={styles.buttonSave} onClick={handleSavePreferences}>
                Salvar Preferências
              </button>
              <button className={styles.buttonAccept} onClick={handleAcceptAll}>
                Aceitar Tudo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
export { CookieBanner };