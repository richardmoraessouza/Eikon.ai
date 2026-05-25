import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './App.module.css';
import { useAuth } from './hooks/AuthContext/AuthContext';
import Menu from './components/Menu/Menu';
import ProfilePerson from './components/ProfilePerson/ProfilePerson';
import { useParams } from 'react-router-dom';

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

  const { usuarioId, token } = useAuth(); // Adicione o token aqui
  const chatEndRef = useRef<HTMLDivElement | null>(null);


  // ID numérico da URL (fonte da verdade para qual personagem mostrar)
  const idNum = id != null ? Number(id) : NaN;
  const personagemId = !isNaN(idNum) ? idNum : personId;

  if (!personagemId) {
  console.error("personagemId inválido! Abortando envio.");
  return;
}

  // Gera ou recupera ID anônimo
  useEffect(() => {
    if (!localStorage.getItem("anonId")) {
      localStorage.setItem("anonId", crypto.randomUUID());
    }
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

      const res = await axios.post<ChatResponse>(
      `http://localhost:3001/chat/chat/${personagemId}`,
      { message: userMsg },
      config
      );

    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);

      const msgErro = err.response?.status === 401
        ? 'Sua sessão expirou. Por favor, faça login novamente.'
        : err.response?.status === 404
        ? 'Personagem não encontrado.'
        : err.response?.status === 503
        ? 'Serviço temporariamente indisponível. Tente mais tarde.'
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

      <div className={styles.containerChat}>
        <div className={`${styles.espaco} ${!menuOpen ? styles.menuFechado : ''}`}></div>
        <main className={`${styles.chat} flex flex-col`}>

          <div className={styles.containerEmCima}></div>

          {/* Chat */}
          <section className={styles.conversas}>
            {chatHistory.map((msg, idx) => (
              <article
                key={idx}
                className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage
                  }`}
              >
                <div className={`${styles.bubble} ${msg.isError ? styles.erroMensagem : ''}`}>

                  {!msg.text.includes('data:image') && <p>{msg.text}</p>}

                  {msg.figurinha && (
                    <div className="w-full flex items-center justify-center">
                      <img
                        src={msg.figurinha.url}
                        alt="figurinha"
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
                  <div className={styles.typingIndicator}><span></span><span></span><span></span></div>
                </div>
              </article>
            )}
            <div className={styles.espaco2}></div>
            <div ref={chatEndRef}></div>
          </section>

          {/* Input de mensagem */}
          <div className={`fixed bottom-8 ${styles.containerMensagem}`}>
            <input
              className={styles.mensagem}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Fale com o personagem"
              disabled={isLoading}
            />
            <button
              onClick={enviarMensagem}
              disabled={isLoading || !message.trim()}
              title="Enviar mensagem (Enter)"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;