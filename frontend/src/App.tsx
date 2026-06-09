import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './App.module.css';
import { useAuth } from './hooks/AuthContext/AuthContext';
import { recentCharacters } from './services/personagemService';
import Menu from './components/Menu/Menu';
import ProfilePerson from './components/ProfilePerson/ProfilePerson';
import { useParams } from 'react-router-dom';
import { FiSend } from "react-icons/fi";
import { API_URL } from './config/api';
import { useCharacters } from './hooks/useCharacters/useCharacters';

interface ChatResponse {
  reply: string;
  figurinha?: {
    url: string;
    sentiment?: string;
    id?: number;
  } | null;
  success?: boolean;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isError?: boolean;
  figurinha?: {
    url: string;
    sentiment?: string;
    id?: number;
  } | null;
}

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [perfilPerson, setPerfilPerson] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const [personId, setPersonId] = useState<number>(() => {
    const n = id != null ? Number(id) : NaN;
    return isNaN(n) ? 29 : n;
  });

  const [menuOpen, setMenuOpen] = useState<boolean>(true);

  const { usuarioId, token } = useAuth(); 
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { incrementChatViews } = useCharacters();


  // ID numérico da URL (fonte da verdade para qual personagem mostrar)
  const idNum = id != null ? Number(id) : NaN;
  const personagemId = !isNaN(idNum) ? idNum : personId;
  
  // Gera ou recupera ID anônimo
  useEffect(() => {
    if (!localStorage.getItem("anonId")) {
      localStorage.setItem("anonId", crypto.randomUUID());
    }
  }, []);

  // Aplica o tema salvo ao iniciar a aplicação
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'sistema';
    const savedChatStyle = localStorage.getItem('chatStyle') || 'padrao';
    
    const applyTheme = (theme: string) => {
      const htmlElement = document.documentElement;
      if (theme === 'claro') {
        htmlElement.setAttribute('data-theme', 'light');
        document.body.style.colorScheme = 'light';
      } else if (theme === 'escuro') {
        htmlElement.setAttribute('data-theme', 'dark');
        document.body.style.colorScheme = 'dark';
      } else {
        // Sistema - remove o atributo data-theme para usar a preferência do SO
        htmlElement.removeAttribute('data-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.style.colorScheme = prefersDark ? 'dark' : 'light';
      }
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

    applyTheme(savedTheme);
    applyChatStyle(savedChatStyle);
    
    // Listener para mudanças de preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = localStorage.getItem('appTheme') || 'sistema';
      if (currentTheme === 'sistema') {
        applyTheme('sistema');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sincroniza personId com o param da rota (para chat e menu)
  useEffect(() => {
    if (id != null) {
      const parsed = Number(id);
      if (!isNaN(parsed) && parsed !== personId) {
        setPersonId(parsed);
      }
    }
  }, [id]);

  // Limpa chat ao trocar de personagem
  useEffect(() => setChatHistory([]), [personagemId]);

  // Scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const enviarMensagem = async () => {
    if (!personagemId) {
      console.error("personagemId inválido! Abortando envio.");
      return;
    }

    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);

    try {
      setIsLoading(true);

      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      // 1. Envia a mensagem para a IA
      const res = await axios.post<ChatResponse>(
        `${API_URL}/chat/chat/${personagemId}`,
        { message: userMsg },
        config
      );

      // 2. Registra o personagem nos Recentes do usuário
      if (usuarioId && personagemId) {
        await recentCharacters(Number(usuarioId), Number(personagemId), token ?? undefined);
      }

      // 3. Executa o incremento de views passando o token necessário
      if (personagemId && token) {
        await incrementChatViews(personagemId, token ?? undefined); 
      }

      // 3. Adiciona a resposta da IA na tela
      if (res.data && res.data.reply) {
        setChatHistory(prev => [
          ...prev,
          { sender: 'bot', text: res.data.reply, figurinha: res.data.figurinha }
        ]);
      }

    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);

      const msgErro = err.response?.status === 401
        ? 'Sua sessão expirou. Por favor, faça login novamente.'
        : err.response?.status === 404
        ? 'Personagem não encontrado.'
        : err.response?.status === 503
        ? 'Minha mente está um pouco confusa agora... me chame novamente daqui a pouco.'
        : 'Ocorreu um erro, tente novamente mais tarde.';

      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', text: msgErro, isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && message.trim()) {
      enviarMensagem();
    }
  };

  return (
    <>
      <Menu setPersonId={setPersonId} onMenuToggle={setMenuOpen} />
  

      <ProfilePerson 
        personagemId={id ? Number(id) : null}
        menuOpen={menuOpen}
        usuarioIdAtual={usuarioId || null}
        perfilPerson={perfilPerson}
        setPerfilPerson={setPerfilPerson}
      />

      <div className={`${styles.containerChat} ${menuOpen ? styles.menuAberto : ''}`}>
        <div className={`${styles.espaco} ${!menuOpen ? styles.menuFechado : ''}`}></div>
        <main className={`${styles.chat} flex flex-col`}>

          <div className={styles.containerEmCima}></div>

          {/* Chat */}
          <section className={styles.conversas}>
            {chatHistory.map((msg, idx) => (
              <article
                key={idx}
                className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
              >
                <div className={`${styles.bubble} ${msg.isError ? styles.erroMensagem : ''}`}>
                  {!msg.text.includes('data:image') && (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  )}

                  {msg.figurinha && (
                    <div className='w-full flex items-center justify-center'>
                      <img
                        src={msg.figurinha.url}
                        alt='figurinha'
                        className={styles.figurinha}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}

            {isLoading && (
              <article className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.bubble}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </article>
            )}
            <div className={styles.espaco2}></div>
            <div ref={chatEndRef}></div>
          </section>

          {/* Input de Mensagem */}
          <div className={`fixed ${styles.containerMensagem}`}>
            <input
              className={styles.mensagem}
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder='Fale com o personagem...'
              disabled={isLoading}
            />
            <button
              onClick={enviarMensagem}
              disabled={isLoading || !message.trim()}
              title='Enviar (Enter)'
            >
              <FiSend size={20} />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;