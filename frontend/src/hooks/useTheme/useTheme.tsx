import { useEffect } from 'react';

function applyTheme(theme: string) {
  const html = document.documentElement;
  if (theme === 'claro') {
    html.setAttribute('data-theme', 'light');
    document.body.style.colorScheme = 'light';
  } else if (theme === 'escuro') {
    html.setAttribute('data-theme', 'dark');
    document.body.style.colorScheme = 'dark';
  } else {
    html.removeAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.style.colorScheme = prefersDark ? 'dark' : 'light';
  }
}

function applyChatStyle(style: string) {
  const root = document.documentElement;
  switch (style) {
    case 'elegante':
      root.style.setProperty('--chat-font-family', "'Georgia', 'Times New Roman', serif");
      root.style.setProperty('--chat-letter-spacing', '0.3px');
      break;
    case 'compacto':
      root.style.setProperty('--chat-font-family', "'Courier New', 'Monaco', monospace");
      root.style.setProperty('--chat-letter-spacing', '0.5px');
      break;
    default:
      root.style.setProperty('--chat-font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
      root.style.setProperty('--chat-letter-spacing', '0.2px');
  }
}

export function useTheme() {
  useEffect(() => {
    const savedTheme     = localStorage.getItem('appTheme')   || 'sistema';
    const savedChatStyle = localStorage.getItem('chatStyle')  || 'padrao';
    const savedBotBg     = localStorage.getItem('botBg');
    const savedUserBg    = localStorage.getItem('userBg');

    applyTheme(savedTheme);
    applyChatStyle(savedChatStyle);

    if (savedBotBg)  document.body.style.setProperty('--bot-bubble-message-bg',  savedBotBg);
    if (savedUserBg) document.body.style.setProperty('--user-bubble-message-bg', savedUserBg);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if ((localStorage.getItem('appTheme') || 'sistema') === 'sistema') {
        applyTheme('sistema');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
}