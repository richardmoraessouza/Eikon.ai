import React, { useState, useEffect } from 'react';
import styles from './TapsPreferencesTheme.module.css';

interface TapsPreferencesThemeProps {
  onThemeChange?: (theme: string) => void;
}

const TapsPreferencesTheme: React.FC<TapsPreferencesThemeProps> = ({ onThemeChange }) => {
  const [theme, setTheme] = useState<string>('sistema');
  const [styleChat, setStyleChat] = useState<string>('predefinicao');
 
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'sistema';
    const savedStyle = localStorage.getItem('chatStyle') || 'predefinicao';

    setTheme(savedTheme);
    setStyleChat(savedStyle);

    applyTheme(savedTheme);
  }, []);

  // Função para aplicar o tema globalmente
  const applyTheme = (selectedTheme: string) => {
    const htmlElement = document.documentElement;

    if (selectedTheme === 'claro') {
      htmlElement.setAttribute('data-theme', 'light');
      document.body.style.colorScheme = 'light';
    } else if (selectedTheme === 'escuro') {
      htmlElement.setAttribute('data-theme', 'dark');
      document.body.style.colorScheme = 'dark';
    } else {
      // Sistema - remove o atributo data-theme para usar a preferência do SO
      htmlElement.removeAttribute('data-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.style.colorScheme = prefersDark ? 'dark' : 'light';
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    applyTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handleStyleChange = (newStyle: string) => {
    setStyleChat(newStyle);
    localStorage.setItem('chatStyle', newStyle);
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label} style={{ color: 'var(--text-main)' }}>Tema</label>
        <div className={styles.themeOptions}>
          <button
            onClick={() => handleThemeChange('sistema')}
            className={`${styles.themeButton} ${theme === 'sistema' ? styles.active : ''}`}
            style={{
              color: theme === 'sistema' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: theme === 'sistema' ? 'var(--profile-description-bg)' : 'transparent'
            }}
          >
            {theme === 'sistema' && <span className={styles.checkmark}>●</span>}
            Sistema
          </button>

          <button
            onClick={() => handleThemeChange('claro')}
            className={`${styles.themeButton} ${theme === 'claro' ? styles.active : ''}`}
            style={{
              color: theme === 'claro' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: theme === 'claro' ? 'var(--profile-description-bg)' : 'transparent'
            }}
          >
            {theme === 'claro' && <span className={styles.checkmark}>●</span>}
            Claro
          </button>

          <button
            onClick={() => handleThemeChange('escuro')}
            className={`${styles.themeButton} ${theme === 'escuro' ? styles.active : ''}`}
            style={{
              color: theme === 'escuro' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: theme === 'escuro' ? 'var(--profile-description-bg)' : 'transparent'
            }}
          >
            {theme === 'escuro' && <span className={styles.checkmark}>●</span>}
            Escuro
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label} style={{ color: 'var(--text-main)' }}>Estilo do chat</label>
        <div className={styles.styleOptions}>
          <button
            onClick={() => handleStyleChange('predefinicao')}
            className={`${styles.styleButton} ${styleChat === 'predefinicao' ? styles.active : ''}`}
            style={{
              color: styleChat === 'predefinicao' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: styleChat === 'predefinicao' ? 'var(--profile-description-bg)' : 'transparent'
            }}
          >
            {styleChat === 'predefinicao' && <span className={styles.checkmark}>●</span>}
            Predefinição
          </button>
          <button
            onClick={() => handleStyleChange('classico')}
            className={styles.styleButton}
            style={{
              color: styleChat === 'classico' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: styleChat === 'classico' ? 'var(--profile-description-bg)' : 'transparent'
            }}
          >
            {styleChat === 'classico' && <span className={styles.checkmark}>●</span>}
            Clássico
          </button>
          <button
            onClick={() => handleStyleChange('denso')}
            className={styles.styleButton}
            style={{
              color: styleChat === 'denso' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: styleChat === 'denso' ? 'var(--profile-description-bg)' : 'transparent'
            }}
          >
            {styleChat === 'denso' && <span className={styles.checkmark}>●</span>}
            Denso
          </button>
        </div>
      </div>
    </div>
  );
};

export default TapsPreferencesTheme;
