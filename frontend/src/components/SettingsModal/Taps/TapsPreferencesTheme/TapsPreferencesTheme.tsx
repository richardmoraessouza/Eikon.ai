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
    const savedStyle = localStorage.getItem('chatStyle') || 'padrao';

    setTheme(savedTheme);
    setStyleChat(savedStyle);

    applyTheme(savedTheme);
    applyChatStyle(savedStyle);
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
    applyChatStyle(newStyle);
  };

  const applyChatStyle = (style: string) => {
    const root = document.documentElement;
    
    switch(style) {
      case 'elegante':
        root.style.setProperty('--chat-font-family', "'Georgia', 'Times New Roman', serif");
        root.style.setProperty('--chat-letter-spacing', '0.3px');
        break;
      case 'compacto':
        root.style.setProperty('--chat-font-family', "'Courier New', 'Monaco', monospace");
        root.style.setProperty('--chat-letter-spacing', '0.5px');
        break;
      case 'padrao':
      default:
        root.style.setProperty('--chat-font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
        root.style.setProperty('--chat-letter-spacing', '0.2px');
    }
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
        <label className={styles.label} style={{ color: 'var(--text-main)' }}>Fonte do chat</label>
        <div className={styles.styleOptions}>
          <button
            onClick={() => handleStyleChange('padrao')}
            className={`${styles.styleButton} ${styleChat === 'padrao' ? styles.active : ''}`}
            style={{
              color: styleChat === 'padrao' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: styleChat === 'padrao' ? 'var(--profile-description-bg)' : 'transparent',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            {styleChat === 'padrao' && <span className={styles.checkmark}>●</span>}
            Padrão
          </button>
          <button
            onClick={() => handleStyleChange('elegante')}
            className={styles.styleButton}
            style={{
              color: styleChat === 'elegante' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: styleChat === 'elegante' ? 'var(--profile-description-bg)' : 'transparent',
              fontFamily: "'Georgia', serif"
            }}
          >
            {styleChat === 'elegante' && <span className={styles.checkmark}>●</span>}
            Elegante
          </button>
          <button
            onClick={() => handleStyleChange('compacto')}
            className={styles.styleButton}
            style={{
              color: styleChat === 'compacto' ? 'var(--text-main)' : 'var(--profile-text-muted)',
              backgroundColor: styleChat === 'compacto' ? 'var(--profile-description-bg)' : 'transparent',
              fontFamily: "'Courier New', monospace"
            }}
          >
            {styleChat === 'compacto' && <span className={styles.checkmark}>●</span>}
            Compacto
          </button>
        </div>
      </div>
    </div>
  );
};

export default TapsPreferencesTheme;
