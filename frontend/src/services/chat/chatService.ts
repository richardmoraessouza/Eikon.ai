import axios from 'axios';
import { API_URL } from '../../config/api';
import type {
  ChatMessage as ChatMessageType,
  ChatResponse,
  BackendMessage,
  ConversationTimePayload,
  ConversationTimeFetchResponse,
  ConversationTimeResponse,
  ClearChatResponse,
} from '../../types/chat/chat';

const getOrCreateAnonymousId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = window.localStorage.getItem('anonId');
  if (existing) {
    return existing;
  }

  const generated = window.crypto?.randomUUID?.() ?? `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem('anonId', generated);

  const cookieValue = `${encodeURIComponent('anonId')}=${encodeURIComponent(generated)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  document.cookie = cookieValue;

  return generated;
};

const getAnonymousHeaders = () => {
  const anonId = getOrCreateAnonymousId();
  return anonId ? { 'x-anon-id': anonId } : {};
};

/**
 * Nenhuma função deste arquivo monta headers de Authorization manualmente.
 * O interceptor global (ver axiosConfig.ts) já injeta o token em toda
 * requisição axios automaticamente. Isso evita duplicação e garante que
 * mudanças na lógica de auth (ex: limpeza de sessão em 401) fiquem
 * centralizadas em um único lugar.
 */

/**
 * Fetch a single message by ID (used to populate quote/reply references)
 */
export const getMessageById = async (
  characterId: string | number,
  messageId: number
): Promise<ChatMessageType | null> => {
  try {
    const response = await axios.get<BackendMessage>(
      `${API_URL}/chat/chat/${characterId}/message/${messageId}`,
      { headers: getAnonymousHeaders() }
    );

    return {
      id: response.data.id,
      sender: response.data.role === 'model' ? 'model' : 'user',
      text: response.data.content,
      pinned: response.data.is_pinned,
      isError: false,
      reply_to_id: response.data.reply_to_id || null,
    };
  } catch (err) {
    console.error('[ChatService] Could not fetch message:', messageId, err);
    return null;
  }
};

/**
 * Fetch a paginated chunk of conversation history from the backend.
 * Inclui reply_to_id para reconstruir mensagens citadas/respondidas.
 *
 * NOTA: as quotes são buscadas em sequência (uma request por mensagem
 * com reply_to_id). Isso é uma limitação de performance conhecida —
 * o ideal é o backend já devolver a quote embutida no histórico
 * paginado. Fica registrado como próximo item a resolver.
 */
export const fetchChatHistory = async (
  characterId: string | number,
  limit: number = 30,
  offset: number = 0
): Promise<ChatMessageType[]> => {
  const response = await axios.get<BackendMessage[]>(
    `${API_URL}/chat/chat/${characterId}/historico?limit=${limit}&offset=${offset}`,
    { headers: getAnonymousHeaders() }
  );

  const messages = response.data.map((msg) => ({
    id: msg.id,
    sender: (msg.role === 'model' ? 'model' : 'user') as 'user' | 'model',
    text: msg.content,
    pinned: msg.is_pinned,
    isError: false,
    reply_to_id: msg.reply_to_id || null,
    quote: undefined as ChatMessageType['quote'],
  }));

  for (const msg of messages) {
    if (!msg.reply_to_id) continue;

    try {
      const originalMsg = await getMessageById(characterId, msg.reply_to_id);
      if (originalMsg) {
        msg.quote = {
          sender: originalMsg.sender,
          text: originalMsg.text,
        };
      }
    } catch (err) {
      console.error('[ChatService] Error fetching quote for message', msg.id, err);
    }
  }

  return messages;
};

/**
 * Dispatches input payloads to trigger Gemini pipelines and message tracking logic.
 * Supports optional replyToId to establish quote/reply relationships.
 */
export const sendChatMessage = async (
  characterId: string | number,
  message: string,
  replyToId?: number | null,
  isVoiceCall?: boolean
): Promise<ChatResponse> => {
  const payload: { message: string; replyToId?: number; isVoiceCall?: boolean } = { message };
  if (replyToId) {
    payload.replyToId = replyToId;
  }
  if (isVoiceCall) {
    payload.isVoiceCall = true;
  }

  const response = await axios.post<ChatResponse>(
    `${API_URL}/chat/chat/${characterId}`,
    payload,
    { headers: getAnonymousHeaders() }
  );

  return response.data;
};

/**
 * Signals backend layers to wipe or invalidate cached text histories inside memory maps
 */
export const clearChatMemory = async (characterId: string | number): Promise<void> => {
  await axios.delete(`${API_URL}/chat/${characterId}/limpar`, { headers: getAnonymousHeaders() });
};

/**
 * Delete a specific message by its unique database ID
 */
export const deleteMessage = async (
  messageId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_URL}/chat/messages/${messageId}`, { headers: getAnonymousHeaders() });
  return response.data;
};

/**
 * Update pin status of a single message
 */
export const togglePinMessage = async (
  messageId: number,
  isPinned: boolean
): Promise<BackendMessage> => {
  const response = await axios.patch(
    `${API_URL}/chat/messages/${messageId}/pin`,
    { isPinned },
    { headers: getAnonymousHeaders() }
  );
  return response.data;
};

/**
 * Fetch all pinned messages from a given chat session ID
 */
export const getPinnedMessages = async (chatId: number): Promise<BackendMessage[]> => {
  const response = await axios.get(`${API_URL}/chat/chats/${chatId}/pinned`, { headers: getAnonymousHeaders() });
  return response.data;
};

/**
 * Extracts and maps server exceptions cleanly to human-friendly feedback messages.
 * Mensagens de status conhecidos são fixas (não repassam texto do backend).
 * Para status desconhecidos, evitamos repassar err.message bruto do axios
 * (pode conter a URL completa da API) e usamos um texto genérico.
 */
export const extractErrorMessage = (err: unknown): string => {
  const axiosErr = err as { response?: { status?: number; data?: { message?: string; error?: string } } };
  const status = axiosErr.response?.status;

  if (status === 401) return 'Sua sessão expirou. Por favor, faça login novamente.';
  if (status === 404) return 'Personagem não encontrado.';
  if (status === 429) return 'Muitas requisições. Aguarde um instante e tente novamente.';
  if (status === 503) return 'Minha mente está um pouco confusa agora... me chame novamente daqui a pouco.';

  // Loga o erro completo só no console (dev/observability), nunca na UI.
  console.error('[ChatService] Unhandled error:', err);

  return 'Ocorreu um erro, tente novamente mais tarde.';
};

/**
 * Save elapsed conversation time for a session
 */
export const saveConversationTime = async (
  payload: ConversationTimePayload
): Promise<ConversationTimeResponse> => {
  const response = await axios.post<ConversationTimeResponse>(
    `${API_URL}/chat/conversation-time`,
    payload,
    { headers: getAnonymousHeaders() }
  );

  console.log('[ChatService] Conversation time saved:', response.data);
  return response.data;
};

/**
 * Fetch total conversation time with a character
 */
export const fetchConversationTime = async (
  characterId: string | number
): Promise<ConversationTimeFetchResponse> => {
  const response = await axios.get<ConversationTimeFetchResponse>(
    `${API_URL}/chat/conversation-time/${characterId}`,
    { headers: getAnonymousHeaders() }
  );

  console.log('[ChatService] Conversation time fetched:', response.data);
  return response.data;
};

/**
 * Send time via sendBeacon (safe for page unload events).
 *
 * Mantemos o envio por cookie de sessão, sem depender de token em localStorage.
 */
export const beaconConversationTime = (payload: ConversationTimePayload): void => {
  const blob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  });
  navigator.sendBeacon(`${API_URL}/chat/conversation-time`, blob);
};

export const clearChatService = async (
  publicId: string | number
): Promise<ClearChatResponse> => {
  const response = await axios.delete<ClearChatResponse>(`${API_URL}/chat/${publicId}/mensagens`, { headers: getAnonymousHeaders() });
  return response.data;
};