import React, { useState, useEffect } from 'react';
import styles from './TapsPreferencesTheme.module.css';

interface TapsPreferencesThemeProps {
  onThemeChange?: (theme: string) => void;
}

const TapsPreferencesTheme: React.FC<TapsPreferencesThemeProps> = ({ onThemeChange }) => {
  const [theme, setTheme] = useState<string>('sistema');
  const [styleChat, setStyleChat] = useState<string>('padrao');
  const [fontSize, setFontSize] = useState<string>('medium');
 
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'sistema';
    const savedStyle = localStorage.getItem('chatStyle') || 'padrao';
    const savedFontSize = localStorage.getItem('chatFontSize') || 'medium';

    setTheme(savedTheme);
    setStyleChat(savedStyle);
    setFontSize(savedFontSize);

    applyTheme(savedTheme);
    applyChatStyle(savedStyle);
    applyFontSize(savedFontSize);
  }, []);

  const applyTheme = (selectedTheme: string) => {
    const htmlElement = document.documentElement;
    if (selectedTheme === 'claro') {
      htmlElement.setAttribute('data-theme', 'light');
    } else if (selectedTheme === 'escuro') {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-theme');
    }
  };

  const applyChatStyle = (style: string) => {
    const root = document.documentElement;
    const stylesMap: { [key: string]: { family: string, spacing: string } } = {
      elegante: { family: "'Georgia', serif", spacing: '0.3px' },
      compacto: { family: "'Courier New', monospace", spacing: '0.5px' },
      padrao: { family: "-apple-system, sans-serif", spacing: '0.2px' }
    };
    const s = stylesMap[style] || stylesMap.padrao;
    root.style.setProperty('--chat-font-family', s.family);
    root.style.setProperty('--chat-letter-spacing', s.spacing);
  };

  const applyFontSize = (size: string) => {
    const root = document.documentElement;
    const sizes: { [key: string]: string } = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--chat-font-size', sizes[size] || '16px');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    applyTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleStyleChange = (newStyle: string) => {
    setStyleChat(newStyle);
    localStorage.setItem('chatStyle', newStyle);
    applyChatStyle(newStyle);
  };

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    localStorage.setItem('chatFontSize', newSize);
    applyFontSize(newSize);
  };

  return (
    <div className={styles.container}>
      {/* SEÇÃO TEMA */}
      <div className={styles.section}>
        <label className={styles.label}>Tema</label>
        <div className={styles.themeOptions}>
          {['sistema', 'claro', 'escuro'].map((t) => (
            <button key={t} onClick={() => handleThemeChange(t)} className={`${styles.themeButton} ${theme === t ? styles.active : ''}`}>
              {theme === t && <span className={styles.checkmark}>●</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* SEÇÃO FONTE CHAT */}
      <div className={styles.section}>
        <label className={styles.label}>Fonte do chat</label>
        <div className={styles.styleOptions}>
          {['padrao', 'elegante', 'compacto'].map((s) => (
            <button key={s} onClick={() => handleStyleChange(s)} className={`${styles.styleButton} ${styleChat === s ? styles.active : ''}`}>
              {styleChat === s && <span className={styles.checkmark}>●</span>}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* SEÇÃO TAMANHO TEXTO */}
      <div className={styles.section}>
        <label className={styles.label}>Tamanho do texto</label>
        <div className={styles.themeOptions}>
          {['small', 'medium', 'large'].map((size) => (
            <button key={size} onClick={() => handleFontSizeChange(size)} className={`${styles.themeButton} ${fontSize === size ? styles.active : ''}`}>
              {fontSize === size && <span className={styles.checkmark}>●</span>}
              {size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TapsPreferencesTheme;