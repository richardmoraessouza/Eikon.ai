import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useCharacters } from '../useCharacters/useCharacters';
import type { ChatMessage as ChatMessageType, ReplyQuote } from '../../types/chat/chat';
import * as chatApiService from '../../services/chat/chatService';

// SSR-safe localStorage wrapper — prevents "localStorage is not defined" errors
// during server-side rendering in Next.js by checking for the window object first
const storage = {
  // Retrieves a value by key; returns null if running on the server
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  // Stores a key-value pair; does nothing if running on the server
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  // Removes a key; does nothing if running on the server
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

export function useChat(personagemId: number) {
  // Retrieves the authenticated user's ID and auth token from the auth context
  const { usuarioId, token } = useAuth();

  // Retrieves character-related utilities: view counter and recent-characters tracker
  const { incrementChatViews, recentCharacters } = useCharacters();

  // Holds the current text typed by the user in the chat input
  const [message, setMessage] = useState('');

  // Holds the message the user is replying to, initialized from localStorage on mount
  // so the reply context is preserved across page refreshes
  const [replyTo, setReplyTo] = useState<ReplyQuote | null>(() => {
    if (!personagemId || isNaN(personagemId)) return null;

    const saved = storage.get(`replyTo_${personagemId}`);
    if (saved) {
      try {
        return JSON.parse(saved) as ReplyQuote;
      } catch {
        // If the stored value is corrupted, remove it and start fresh
        storage.remove(`replyTo_${personagemId}`);
        return null;
      }
    }
    return null;
  });

  // Holds the full list of chat messages displayed in the conversation
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);

  // Holds only the messages that have been pinned by the user
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessageType[]>([]);

  // True while waiting for the AI to respond to a sent message
  const [isLoading, setIsLoading] = useState(false);

  // True while fetching an older page of messages (infinite scroll going upward)
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // True while fetching the initial chat history on first load
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // True while fetching pinned messages on first load
  const [isLoadingPinned, setIsLoadingPinned] = useState(false);

  // Tracks how many messages have been fetched so far (used as SQL OFFSET for pagination)
  const [offset, setOffset] = useState<number>(0);

  // False when the last page returned fewer than 30 messages — no more pages to fetch
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Ref attached to an invisible div at the bottom of the chat — used to auto-scroll down
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Ref attached to the scrollable messages container — used to detect scroll position
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Refs for tracking how long the user spends in this chat session
  const timerStartRef = useRef<number>(Date.now());
  const timerFlushedRef = useRef<boolean>(false);

  // Generates and stores a unique anonymous ID for the session on first visit
  // Used to identify users who are not logged in
  useEffect(() => {
    if (!storage.get('anonId')) {
      storage.set('anonId', crypto.randomUUID());
    }
  }, []);

  // Restores the saved reply-to context from localStorage whenever the character changes
  // This ensures the correct reply is shown if the user navigates between chats
  useEffect(() => {
    if (!personagemId || isNaN(personagemId)) return;

    const saved = storage.get(`replyTo_${personagemId}`);
    if (saved) {
      try {
        setReplyTo(JSON.parse(saved) as ReplyQuote);
      } catch {
        storage.remove(`replyTo_${personagemId}`);
        setReplyTo(null);
      }
    } else {
      setReplyTo(null);
    }
  }, [personagemId]);

  // Resets the chat state and fetches the first page of history and pinned messages
  // whenever the active character (personagemId) changes
  useEffect(() => {
    setChatHistory([]);
    setPinnedMessages([]);
    setOffset(0);
    setHasMore(true);
    setIsLoadingHistory(true);

    if (!personagemId || isNaN(personagemId)) return;

    // Fetches the 30 most recent messages for this character
    async function loadInitialHistory() {
      try {
        setIsLoadingHistory(true);
        const history = await chatApiService.fetchChatHistory(personagemId, token, 30, 0);
        setChatHistory(history);
        // If fewer than 30 messages were returned, there are no more pages
        if (history.length < 30) setHasMore(false);
      } catch (err) {
        console.error('[ChatHook Error] Could not load initial history:', err);
      } finally {
        setIsLoadingHistory(false);
        // Scroll to the bottom after messages are rendered
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      }
    }

    // Fetches all pinned messages for this character and normalizes their format
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

  // Tracks conversation time and flushes it to the server when the user leaves
  // Resets the timer whenever the active character changes
  useEffect(() => {
    if (!usuarioId || !personagemId || isNaN(personagemId)) return;

    timerStartRef.current = Date.now();
    timerFlushedRef.current = false;

    console.log(`[ConversationTimer] Timer started for character ${personagemId} at ${new Date().toISOString()}`);

    const getElapsed = (): number =>
      Math.floor((Date.now() - timerStartRef.current) / 1000);

    const flush = (useBeacon = false): void => {
      if (timerFlushedRef.current) return;
      const seconds = getElapsed();
      console.log(`[ConversationTimer] Flushing ${seconds}s for character ${personagemId} via ${useBeacon ? 'beacon' : 'axios'}`);
      if (seconds < 5) {
        console.log(`[ConversationTimer] Session too short (${seconds}s), skipping save`);
        return;
      }
      timerFlushedRef.current = true;
      if (useBeacon) {
        chatApiService.beaconConversationTime({ characterId: personagemId, seconds });
        console.log(`[ConversationTimer] Beacon sent: ${seconds}s for character ${personagemId}`);
      } else {
        chatApiService.saveConversationTime({ characterId: personagemId, seconds })
          .then(() => console.log(`[ConversationTimer] Saved: ${seconds}s for character ${personagemId}`))
          .catch((err) => console.error('[ConversationTimer Error] Failed to save conversation time:', err));
      }
    };

    const handleUnload = () => {
      console.log('[ConversationTimer] beforeunload fired');
      flush(true);
    };
    const handleVisibility = () => {
      console.log(`[ConversationTimer] visibilitychange: ${document.visibilityState}`);
      if (document.visibilityState === 'hidden') flush(true);
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      console.log(`[ConversationTimer] Cleanup fired for character ${personagemId}`);
      flush(false);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personagemId]); // <- só personagemId, remove usuarioId das dependências

  // Fetches the next batch of 30 older messages and prepends them to the chat history
  // Preserves the scroll position so the user doesn't jump to the top
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !personagemId) return;

    const container = scrollContainerRef.current;
    // Save the current scroll height before prepending new messages
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const nextOffset = offset + 30;

    try {
      setIsLoadingMore(true);
      const olderHistory = await chatApiService.fetchChatHistory(personagemId, token, 30, nextOffset);

      if (olderHistory.length < 30) setHasMore(false);

      if (olderHistory.length > 0) {
        // Prepend older messages to the top of the list
        setChatHistory((prev) => [...olderHistory, ...prev]);
        setOffset(nextOffset);
        // Restore scroll position after the DOM updates
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

  // Persists the current replyTo state to localStorage whenever it changes
  // so the reply context survives a page refresh
  useEffect(() => {
    if (!personagemId) return;
    const key = `replyTo_${personagemId}`;
    if (replyTo) {
      storage.set(key, JSON.stringify(replyTo));
    } else {
      storage.remove(key);
    }
  }, [replyTo, personagemId]);

  // Detects when the user scrolls to the top of the chat container
  // and triggers the next page of older messages to load
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop <= 5 && !isLoading && !isLoadingMore && hasMore) {
      loadMoreMessages();
    }
  };

  // Sends the current message to the API and handles the AI response
  // Also tracks analytics (views and recent characters) after a successful send
  const enviarMensagem = async () => {
    const trimmedMessage = message.trim();
    if (isLoading || !trimmedMessage || !personagemId) return;

    // Capture reply context before clearing it
    const currentQuote = replyTo ? replyTo : undefined;
    const replyToId = replyTo?.id || null;

    setMessage('');
    setIsLoading(true);

    // Optimistically add the user's message to the chat immediately
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

    // Clear the reply context after the message is sent
    setReplyTo(null);
    storage.remove(`replyTo_${personagemId}`);

    // Scroll to the bottom to show the new message
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);

    try {
      const data = await chatApiService.sendChatMessage(personagemId, trimmedMessage, token, replyToId);

      // Track this character as recently visited for the logged-in user
      if (usuarioId && personagemId) {
        recentCharacters(Number(usuarioId), Number(personagemId)).catch((e) =>
          console.warn('[Analytics Warning] Recent tracking engine issue:', e.message)
        );
      }

      // Increment the chat view counter for this character
      if (personagemId && token) {
        incrementChatViews(personagemId, token ?? undefined).catch((e) =>
          console.warn('[Analytics Warning] View frame tracker engine issue:', e.message)
        );
      }

      // Handle the AI response — may be a single message or an array of messages
      if (data?.reply) {
        const mensagens = Array.isArray(data.reply) ? data.reply : [data.reply];

        for (let i = 0; i < mensagens.length; i++) {
          setIsLoading(true);

          // Add a small delay between multiple responses to simulate natural typing
          await new Promise(r => setTimeout(r, i * 800));

          const refId = data.replyToIds?.[i] ?? null;
          const quoteData = refId ? data.quotes?.[refId] : null;

          // Append each AI response message to the chat history
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
      // Display the error as a bot message in the chat so the user is aware
      const msgErro = chatApiService.extractErrorMessage(err);
      setChatHistory((prev) => [...prev, { id: Date.now(), sender: 'model', text: msgErro, pinned: false, isError: true }]);
      setIsLoading(false);
    }
  };

  // Removes a message from both the chat history and pinned list,
  // then calls the API to delete it from the server
  const handleDeleteMessage = useCallback(async (msg: ChatMessageType) => {
    try {
      setChatHistory((prev) => prev.filter((m) => m.id !== msg.id));
      setPinnedMessages((prev) => prev.filter((m) => m.id !== msg.id));
      await chatApiService.deleteMessage(msg.id);
    } catch (err) {
      console.error('[ChatHook Error] Failed to delete target message:', err);
    }
  }, []);

  // Toggles the pinned state of a message optimistically in the UI,
  // then syncs the new state with the server
  const handleTogglePinMessage = useCallback(async (msg: ChatMessageType) => {
    try {
      const nextPinState = !msg.pinned;

      // Update the pinned flag on the message inside chat history
      setChatHistory((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, pinned: nextPinState } : m))
      );

      if (nextPinState) {
        // Add to pinned list only if not already there
        const pinnedItem: ChatMessageType = { ...msg, pinned: true };
        setPinnedMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, pinnedItem];
        });
      } else {
        // Remove from pinned list
        setPinnedMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }

      // Persist the new pin state to the server
      await chatApiService.togglePinMessage(msg.id, nextPinState);
    } catch (err) {
      console.error('[ChatHook Error] Pin status adjustment interaction failed:', err);
    }
  }, []);

  // Sends the message when the user presses Enter (only if not already loading)
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
    isLoadingHistory,
    enviarMensagem,
    handleKeyPress,
    handleDeleteMessage,
    handleTogglePinMessage,
  };
}