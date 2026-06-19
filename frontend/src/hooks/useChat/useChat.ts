import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useCharacters } from '../useCharacters/useCharacters';
import type { ChatMessage as ChatMessageType, ReplyQuote } from '../../types/chat/chat';
import * as chatApiService from '../../services/chat/chatService';

export function useChat(personagemId: number) {
  const { usuarioId, token } = useAuth();
  const { incrementChatViews, recentCharacters } = useCharacters();

  const [message, setMessage] = useState('');
  
  // Initialize replyTo directly from localStorage with initializer function
  const [replyTo, setReplyTo] = useState<ReplyQuote | null>(() => {
    // Try to load from current personagemId on mount
    if (!personagemId || isNaN(personagemId)) return null;
    
    const storageKey = `replyTo_${personagemId}`;
    const savedReplyTo = localStorage.getItem(storageKey);
    
    if (savedReplyTo) {
      try {
        return JSON.parse(savedReplyTo) as ReplyQuote;
      } catch {
        localStorage.removeItem(storageKey);
        return null;
      }
    }
    return null;
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingPinned, setIsLoadingPinned] = useState(false);
  
  // Pagination States
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Secured initialization for unique anonymous contexts
  useEffect(() => {
    if (!localStorage.getItem('anonId')) {
      localStorage.setItem('anonId', crypto.randomUUID());
    }
  }, []);

  // Reload replyTo from localStorage when personagemId changes
  useEffect(() => {
    if (!personagemId || isNaN(personagemId)) return;
    
    const storageKey = `replyTo_${personagemId}`;
    const savedReplyTo = localStorage.getItem(storageKey);
    
    if (savedReplyTo) {
      try {
        const parsed = JSON.parse(savedReplyTo) as ReplyQuote;
        setReplyTo(parsed);
      } catch {
        localStorage.removeItem(storageKey);
        setReplyTo(null);
      }
    } else {
      setReplyTo(null);
    }
  }, [personagemId]);

  // Flush states and fetch the fresh first page (offset 0) and pinned messages upon character change
  useEffect(() => {
    setChatHistory([]);
    setPinnedMessages([]);
    setOffset(0);
    setHasMore(true);
    
    if (!personagemId || isNaN(personagemId)) return;

    async function loadInitialHistory() {
      try {
        setIsLoading(true);
        const history = await chatApiService.fetchChatHistory(personagemId, token, 30, 0);
        setChatHistory(history);
        
        if (history.length < 30) {
          setHasMore(false);
        }
      } catch (err) {
        console.error('[ChatHook Error] Could not load initial history:', err);
      } finally {
        setIsLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      }
    }

    async function loadPinned() {
      try {
        setIsLoadingPinned(true);
        const pinnedData = await chatApiService.getPinnedMessages(personagemId);
        
        const formattedPinned = pinnedData.map((msg: any): ChatMessageType => ({
          id: msg.id,
          sender: msg.role === 'model' ? 'model' : ('user' as const),
          text: msg.content,
          pinned: true,
          isError: false,
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

  /**
   * Fetches the next batch of 30 historical logs when the client reaches the container's top boundary
   */
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !personagemId) return;

    const container = scrollContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const nextOffset = offset + 30;

    try {
      setIsLoadingMore(true);
      const olderHistory = await chatApiService.fetchChatHistory(personagemId, token, 30, nextOffset);

      if (olderHistory.length < 30) {
        setHasMore(false);
      }

      if (olderHistory.length > 0) {
        setChatHistory((prev) => [...olderHistory, ...prev]);
        setOffset(nextOffset);

        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          }
        }, 10);
      }
    } catch (err) {
      console.error('[ChatHook Error] Pagination fetching failed:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Save replyTo to localStorage whenever it changes
  useEffect(() => {
    if (!personagemId) return;

    const storageKey = `replyTo_${personagemId}`;
    
    if (replyTo) {
      localStorage.setItem(storageKey, JSON.stringify(replyTo));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [replyTo, personagemId]);

  /**
   * Scroll event boundary listener that triggers data pagination sequences
   */
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    
    if (target.scrollTop <= 5 && !isLoading && !isLoadingMore && hasMore) {
      loadMoreMessages();
    }
  };

  /**
   * Sends the typed text state downstream, logging metrics sequentially
   */
 /**
   * Sends the typed text state downstream, logging metrics sequentially
   */
  const enviarMensagem = async () => {
    const trimmedMessage = message.trim();
    if (isLoading || !trimmedMessage || !personagemId) return;

    const currentQuote = replyTo ? replyTo : undefined;
    const replyToId = replyTo?.id || null;

    setMessage('');
    
    // 1. Activate loading immediately when sending
    setIsLoading(true); 

    setChatHistory((prev) => [
      ...prev, 
      { 
        id: Date.now(), 
        sender: 'user', 
        text: trimmedMessage, 
        pinned: false,
        isError: false, 
        reply_to_id: replyToId,
        quote: currentQuote, 
      }
    ]);
    setReplyTo(null);

    // Clear the replyTo from localStorage after message is sent
    const storageKey = `replyTo_${personagemId}`;
    localStorage.removeItem(storageKey);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);

    try {
      // Pass replyToId to the service
      const data = await chatApiService.sendChatMessage(personagemId, trimmedMessage, token, replyToId);

      if (usuarioId && personagemId) {
        recentCharacters(Number(usuarioId), Number(personagemId)).catch((e) =>
          console.warn('[Analytics Warning] Recent tracking engine issue:', e.message)
        );
      }
      if (personagemId && token) {
        incrementChatViews(personagemId, token ?? undefined).catch((e) =>
          console.warn('[Analytics Warning] View frame tracker engine issue:', e.message)
        );
      }

      if (data?.reply) {
        const mensagens = Array.isArray(data.reply) ? data.reply : [data.reply];

        for (let i = 0; i < mensagens.length; i++) {
          setIsLoading(true);

          await new Promise(r => setTimeout(r, i * 800));
          
          setChatHistory((prev) => [
            ...prev,
            { 
              id: data.id ? data.id + i : Date.now(), 
              sender: 'model', 
              text: mensagens[i], 
              pinned: false,
              isError: false 
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
    if (e.key === 'Enter' && !isLoading && message.trim()) {
      enviarMensagem();
    }
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
    enviarMensagem,
    handleKeyPress,
    handleDeleteMessage,
    handleTogglePinMessage,
  };
}