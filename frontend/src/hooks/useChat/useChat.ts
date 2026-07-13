import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useCharacters } from '../useCharacters/useCharacters';
import type { ChatMessage as ChatMessageType, ReplyQuote } from '../../types/chat/chat';
import * as chatApiService from '../../services/chat/chatService';

const storage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

const MISSION_LABELS: Record<string, string> = {
  CHAT_MESSAGES:        '🏆 Missão completa: Mande mensagens!',
  TALK_CHARACTER:       '🏆 Missão completa: Novo personagem!',
  MAKE_CHARACTER_ANGRY: '🏆 Missão completa: Personagem irritado!',
  MAKE_CHARACTER_SAD:   '🏆 Missão completa: Personagem triste!',
  MAKE_CHARACTER_HAPPY: '🏆 Missão completa: Personagem feliz!',
  MAKE_CHARACTER_LOVE:  '🏆 Missão completa: Personagem apaixonado!',
};

export function useChat(personagemId: string | number | undefined) {
  const { usuarioId, token } = useAuth();
  const { incrementChatViews, recentCharacters } = useCharacters();

  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyQuote | null>(() => {
    if (!personagemId) return null;
    const saved = storage.get(`replyTo_${personagemId}`);
    if (saved) {
      try { return JSON.parse(saved) as ReplyQuote; }
      catch { storage.remove(`replyTo_${personagemId}`); return null; }
    }
    return null;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingPinned, setIsLoadingPinned] = useState(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // ── Notificações de missão completa ──
  const [missionToasts, setMissionToasts] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const timerStartRef = useRef<number>(Date.now());
  const timerFlushedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!storage.get('anonId')) storage.set('anonId', crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!personagemId) return;
    const saved = storage.get(`replyTo_${personagemId}`);
    if (saved) {
      try { setReplyTo(JSON.parse(saved) as ReplyQuote); }
      catch { storage.remove(`replyTo_${personagemId}`); setReplyTo(null); }
    } else {
      setReplyTo(null);
    }
  }, [personagemId]);

  useEffect(() => {
    setChatHistory([]);
    setPinnedMessages([]);
    setOffset(0);
    setHasMore(true);
    setIsLoadingHistory(true);

    if (!personagemId) return;

    async function loadInitialHistory() {
      try {
        setIsLoadingHistory(true);
        const history = await chatApiService.fetchChatHistory(personagemId as string | number, 30, 0);
        setChatHistory(history);
        if (history.length < 30) setHasMore(false);
      } catch (err) {
        console.error('[ChatHook Error] Could not load initial history:', err);
      } finally {
        setIsLoadingHistory(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      }
    }

    async function loadPinned() {
      try {
        setIsLoadingPinned(true);
        const history = await chatApiService.fetchChatHistory(personagemId as string | number, 1000, 0);
        const formattedPinned = history
          .filter((msg) => msg.pinned)
          .map((msg): ChatMessageType => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            pinned: true,
            isError: false,
            reply_to_id: msg.reply_to_id ?? null,
            quote: msg.quote,
          }));
        setPinnedMessages(formattedPinned);
      } catch (err) {
        console.error('[ChatHook Error] Could not load pinned messages:', err);
      } finally {
        setIsLoadingPinned(false);
      }
    }

    loadInitialHistory();
    loadPinned();
  }, [personagemId, token]);

  useEffect(() => {
    if (!usuarioId || !personagemId) return;

    timerStartRef.current = Date.now();
    timerFlushedRef.current = false;

    const getElapsed = (): number => Math.floor((Date.now() - timerStartRef.current) / 1000);

    const flush = (useBeacon = false): void => {
      if (timerFlushedRef.current) return;
      const seconds = getElapsed();
      if (seconds < 5) return;
      timerFlushedRef.current = true;
      const charId = personagemId as string | number;
      if (!charId) return;

      if (useBeacon) {
        chatApiService.beaconConversationTime({ characterId: charId, seconds });
      } else {
        chatApiService.saveConversationTime({ characterId: charId, seconds }).catch(console.error);
      }
    };

    const handleUnload = () => flush(true);
    const handleVisibility = () => { if (document.visibilityState === 'hidden') flush(true); };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      flush(false);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [personagemId, usuarioId]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !personagemId) return;
    const container = scrollContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const nextOffset = offset + 30;

    try {
      setIsLoadingMore(true);
      const olderHistory = await chatApiService.fetchChatHistory(personagemId as string | number, 30, nextOffset);
      if (olderHistory.length < 30) setHasMore(false);
      if (olderHistory.length > 0) {
        setChatHistory((prev) => [...olderHistory, ...prev]);
        setOffset(nextOffset);
        setTimeout(() => {
          if (container) container.scrollTop = container.scrollHeight - previousScrollHeight;
        }, 10);
      }
    } catch (err) {
      console.error('[ChatHook Error] Pagination fetching failed:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!personagemId) return;
    const key = `replyTo_${personagemId}`;
    if (replyTo) storage.set(key, JSON.stringify(replyTo));
    else storage.remove(key);
  }, [replyTo, personagemId]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop <= 5 && !isLoading && !isLoadingMore && hasMore) loadMoreMessages();
  };

  const enviarMensagem = async () => {
    const trimmedMessage = message.trim();
    if (isLoading || !trimmedMessage || !personagemId) return;

    const charId = personagemId as string | number;
    const currentQuote = replyTo ? replyTo : undefined;
    const replyToId = replyTo?.id || null;
    const optimisticMessageId = -(Date.now() + Math.floor(Math.random() * 1000));

    setMessage('');
    setIsLoading(true);

    setChatHistory((prev) => [
      ...prev,
      {
        id: optimisticMessageId,
        sender: 'user',
        text: trimmedMessage,
        pinned: false,
        isError: false,
        reply_to_id: replyToId,
        quote: currentQuote,
      }
    ]);

    setReplyTo(null);
    storage.remove(`replyTo_${personagemId}`);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);

    try {
      const data = await chatApiService.sendChatMessage(charId, trimmedMessage, replyToId);

      if (data?.id) {
        setChatHistory((prev) =>
          prev.map((m) => (m.id === optimisticMessageId ? { ...m, id: data.id as number } : m))
        );
        setPinnedMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessageId ? { ...m, id: data.id as number } : m))
        );
      }

      if (usuarioId && charId) {
        recentCharacters(Number(usuarioId), charId).catch((e) =>
          console.warn('[Analytics Warning] Recent tracking engine issue:', e.message)
        );
      }

      if (charId && token) {
        incrementChatViews(charId, token ?? undefined).catch((e) =>
          console.warn('[Analytics Warning] View frame tracker engine issue:', e.message)
        );
      }

      // ── Exibe notificação para cada missão completada ──
      if ((data?.missoesCompletadas?.length ?? 0) > 0) {
        const labels = (data.missoesCompletadas as string[]).map(
          (tipo) => MISSION_LABELS[tipo] ?? '🏆 Missão completa!'
        );
        setMissionToasts(labels);
        setTimeout(() => setMissionToasts([]), 4000);
      }

      if (data?.reply) {
        const mensagens = Array.isArray(data.reply) ? data.reply : [data.reply];

        for (let i = 0; i < mensagens.length; i++) {
          setIsLoading(true);
          await new Promise(r => setTimeout(r, i * 800));

          const refId = data.replyToIds?.[i] ?? null;
          const quoteData = refId ? data.quotes?.[refId] : null;

          setChatHistory((prev) => [
            ...prev,
            {
              id: data.replyIds?.[i] ?? (data.id ? data.id + i : Date.now()),
              sender: 'model',
              text: mensagens[i],
              pinned: false,
              isError: false,
              reply_to_id: refId,
              quote: quoteData ?? undefined,
            },
          ]);

          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('[ChatHook Error] Execution failed inside message transmission:', err);
      const msgErro = chatApiService.extractErrorMessage(err);
      setChatHistory((prev) => [...prev, { id: Date.now(), sender: 'model', text: msgErro, pinned: false, isError: true }]);
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = useCallback(async (msg: ChatMessageType) => {
    try {
      setChatHistory((prev) => prev.filter((m) => m.id !== msg.id));
      setPinnedMessages((prev) => prev.filter((m) => m.id !== msg.id));
      await chatApiService.deleteMessage(msg.id);
    } catch (err) {
      console.error('[ChatHook Error] Failed to delete target message:', err);
    }
  }, []);

  const handleTogglePinMessage = useCallback(async (msg: ChatMessageType) => {
    try {
      const nextPinState = !msg.pinned;
      setChatHistory((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, pinned: nextPinState } : m))
      );
      if (nextPinState) {
        const pinnedItem: ChatMessageType = { ...msg, pinned: true };
        setPinnedMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, pinnedItem];
        });
      } else {
        setPinnedMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }
      await chatApiService.togglePinMessage(msg.id, nextPinState);
    } catch (err) {
      console.error('[ChatHook Error] Pin status adjustment interaction failed:', err);
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && message.trim()) enviarMensagem();
  };

  return {
    message,
    setMessage,
    replyTo,
    setReplyTo,
    chatHistory,
    setChatHistory,
    pinnedMessages,
    isLoading,
    isLoadingMore,
    isLoadingPinned,
    chatEndRef,
    scrollContainerRef,
    handleScroll,
    isLoadingHistory,
    enviarMensagem,
    handleKeyPress,
    handleDeleteMessage,
    handleTogglePinMessage,
    missionToasts, // ← novo
  };
}