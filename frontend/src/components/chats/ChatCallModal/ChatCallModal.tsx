"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ChatCallModal.module.css';
import { FiPhoneOff, FiMic, FiMicOff, FiVolume2 } from 'react-icons/fi';
import type { ChatMessage as ChatMessageType } from '@/types/chat/chat';

interface ChatCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  characterPhoto?: string;
  chatHistory: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export function ChatCallModal({
  isOpen,
  onClose,
  characterName,
  characterPhoto,
  chatHistory,
  isLoading,
  onSendMessage,
}: ChatCallModalProps) {
  const [status, setStatus] = useState<'conectando' | 'ouvindo' | 'processando' | 'falando'>('conectando');
  const [transcription, setTranscription] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const ttsActiveRef = useRef<boolean>(false);

  // ── FIX: transcrição "presa no passado" dentro do rec.onend ──
  // rec.onend é definido dentro de startListening() e fecha sobre a
  // variável "transcription" (state) DAQUELE render específico. Quando
  // rec.onresult vai atualizando o state enquanto você fala, isso gera
  // novos renders com um "transcription" novo — mas o callback rec.onend
  // já foi criado e continua enxergando o valor antigo (geralmente vazio,
  // porque a escuta tinha acabado de começar). Resultado: ao parar de
  // falar, o "textoFinal" lido era sempre '', então nada era enviado —
  // parecia que "não pegava a voz", mas na real a voz era capturada e
  // descartada. Um ref sempre reflete o valor MAIS RECENTE, sem depender
  // de qual render fechou o callback.
  const transcriptionRef = useRef<string>('');

  // Fonte de verdade SÍNCRONA sobre a ligação estar aberta.
  // Componente fica sempre montado (o pai só faz isOpen=false),
  // então closures antigas de callbacks assíncronos (onend, onerror,
  // setTimeout, resultado do speechRecognition) não podem confiar em
  // "isOpen" capturado no momento em que a função foi criada.
  // Usamos este ref pra checar o estado ATUAL em tempo real.
  const isOpenRef = useRef<boolean>(false);

  // ── FIX: não falar mensagem antiga ao abrir a ligação ──
  // O chatHistory já vem carregado com o histórico do chat normal. Sem isso,
  // ao abrir a ligação o efeito abaixo via "última mensagem é do model" e
  // falava ela na hora — cortando o microfone (speakResponse chama
  // stopListening()) bem no momento em que você tentava falar.
  // Guardamos o ID da última mensagem que JÁ existia quando a ligação abriu,
  // e um Set de mensagens já faladas nesta sessão de ligação, pra só falar
  // respostas realmente NOVAS.
  const lastMessageIdBeforeCallRef = useRef<number | null>(null);
  const spokenMessageIdsRef = useRef<Set<number>>(new Set());

  // Mantém isOpenRef sincronizado e corta qualquer fala IMEDIATAMENTE
  // assim que a ligação for fechada, não importa em que ponto ela estava.
  useEffect(() => {
    isOpenRef.current = isOpen;

    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      ttsActiveRef.current = false;
    }
  }, [isOpen]);

  // 1. Inicia a ligação
  useEffect(() => {
    if (!isOpen) return;

    setStatus('conectando');
    setIsMuted(false);
    transcriptionRef.current = '';
    setTranscription('');

    // Marca a mensagem que já existia ANTES da ligação começar, pra não
    // ser lida em voz alta como se fosse nova, e zera o registro de
    // mensagens já faladas desta sessão.
    const lastMsg = chatHistory[chatHistory.length - 1];
    lastMessageIdBeforeCallRef.current = lastMsg ? lastMsg.id : null;
    spokenMessageIdsRef.current = new Set();

    const timer = setTimeout(() => {
      setStatus('ouvindo');
      startListening();
    }, 1200);

    return () => {
      clearTimeout(timer);
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      ttsActiveRef.current = false;
    };
  }, [isOpen]);

  // 2. Monitora o histórico para fazer a IA falar quando chegar nova mensagem
  useEffect(() => {
    if (isOpen && !isLoading && chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];

      const isNovaMensagem = lastMsg.id !== lastMessageIdBeforeCallRef.current;
      const jaFalada = spokenMessageIdsRef.current.has(lastMsg.id);

      // Alterado de 'bot' para 'model' para bater com a tipagem "user" | "model"
      if (lastMsg.sender === 'model' && isNovaMensagem && !jaFalada) {
        spokenMessageIdsRef.current.add(lastMsg.id);
        speakResponse(lastMsg.text);
      }
    }
  }, [chatHistory, isLoading, isOpen]);

  // --- Funções da Web Speech API ---

  const speakResponse = (text: string) => {
    // GUARDA PRINCIPAL: nunca fala se a ligação não estiver de fato aberta,
    // não importa quem chamou essa função ou quando.
    if (!isOpenRef.current) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    ttsActiveRef.current = true;
    setStatus('falando');
    stopListening();

    // Limpa Markdown para a fala ficar natural
    const cleanText = text
      .replace(/[*_~`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;

    utterance.onend = () => {
      ttsActiveRef.current = false;
      if (!isOpenRef.current) return; // não reativa o mic se a ligação já fechou
      setStatus('ouvindo');
      if (!isMuted) startListening();
    };

    utterance.onerror = () => {
      ttsActiveRef.current = false;
      if (!isOpenRef.current) return;
      setStatus('ouvindo');
      if (!isMuted) startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!isOpenRef.current) return; // não inicia mic fora da ligação
    if (ttsActiveRef.current || isMuted) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'pt-BR';

    rec.onstart = () => {
      setStatus('ouvindo');
    };

    rec.onresult = (event: any) => {
      let currentTranscription = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscription += event.results[i][0].transcript;
      }
      transcriptionRef.current = currentTranscription;
      setTranscription(currentTranscription);
    };

    rec.onend = () => {
        if (isOpenRef.current && !ttsActiveRef.current) {
            // Lê do REF (valor mais atual), não do state capturado por closure.
            const textoFinal = transcriptionRef.current.trim();

            if (textoFinal.length > 0) {
            setStatus('processando');

            // 2. Usamos o setTimeout para empurrar a atualização do pai para fora
            // da renderização atual, evitando o erro de concorrência de estado.
            setTimeout(() => {
                if (isOpenRef.current) onSendMessage(textoFinal);
            }, 0);

            // Limpa a transcrição para a próxima fala
            transcriptionRef.current = '';
            setTranscription('');
            } else if (!isMuted) {
            setTimeout(() => {
                if (isOpenRef.current) startListening();
            }, 400);
            }
        }
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && isOpenRef.current && !isMuted) {
        setTimeout(() => {
          if (isOpenRef.current) startListening();
        }, 500);
      }
    };

    recognitionRef.current = rec;

    try {
      rec.start();
    } catch (err) {
      // Ex: microfone sem permissão, ou rec.start() chamado 2x seguidas.
      console.error('[ChatCallModal] Falha ao iniciar reconhecimento de voz:', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setTimeout(() => {
        if (isOpenRef.current) startListening();
      }, 200);
    } else {
      setIsMuted(true);
      stopListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950 p-8 text-white">

      {/* Topo da chamada */}
      <div className="flex flex-col items-center mt-12 text-center">
        <h2 className="text-3xl font-extrabold tracking-wide">{characterName}</h2>

        <p className="mt-2 text-zinc-400 font-medium">
          {status === 'conectando' && 'Conectando linha...'}
          {status === 'ouvindo' && (isMuted ? 'Microfone mutado' : '🎙️ Pode falar, estou ouvindo...')}
          {status === 'processando' && 'Pensando na resposta...'}
          {status === 'falando' && '🔊 Falando...'}
        </p>
      </div>

      {/* Avatar com brilho verde SOMENTE quando a IA está falando */}
      <div className="relative flex items-center justify-center my-auto">
        <div className={`${styles.avatarRing} ${status === 'falando' ? styles.speaking : ''}`} />

        <div className={`${styles.avatarWrapper} ${status === 'falando' ? styles.speaking : ''}`}>
          <Image
            src={characterPhoto || '/image/semPerfil.jpg'}
            alt={characterName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

{/* Indicador de fala em tempo real (sem exibir o texto) */}
<div className="w-full max-w-md min-h-16 px-4 py-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center mb-8 flex flex-col items-center justify-center gap-2">
  {status === 'ouvindo' && !isMuted && (
    <div className={`${styles.waveform} ${transcription ? styles.active : ''}`}>
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </div>
  )}

  <p className="text-zinc-500 text-xs font-medium">
    {status === 'ouvindo' && !isMuted && !transcription && "Fale alguma coisa para começar..."}
    {status === 'ouvindo' && !isMuted && transcription && "Ouvindo você..."}
    {status === 'falando' && "A IA está te respondendo por voz..."}
    {status === 'processando' && "Gerando ondas de voz..."}
    {isMuted && "Desmute o microfone para voltar a conversar."}
  </p>
</div>

      {/* Painel de Controles */}
      <div className="flex items-center gap-8 mb-12">
        <button
          onClick={handleToggleMute}
          className={`p-4 rounded-full text-lg transition-all border ${
            isMuted
              ? 'bg-zinc-800 border-zinc-700 text-red-400'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          {isMuted ? <FiMicOff size={22} /> : <FiMic size={22} />}
        </button>

        <button
          onClick={onClose}
          className="p-5 bg-red-600 text-white rounded-full text-xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/30"
        >
          <FiPhoneOff size={28} />
        </button>

        <div className={`p-4 rounded-full border border-zinc-800 bg-zinc-900/40 ${status === 'falando' ? 'text-emerald-400' : 'text-zinc-500'}`}>
          <FiVolume2 size={22} />
        </div>
      </div>

    </div>
  );
}