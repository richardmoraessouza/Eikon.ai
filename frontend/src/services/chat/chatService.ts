import axios from 'axios';
import { API_URL } from '../../config/api';
import type { ChatMessage as ChatMessageType, ChatResponse, BackendMessage, ConversationTimePayload,
  ConversationTimeFetchResponse, ConversationTimeResponse} from '../../types/chat/chat';

/**
 * Helper to get authorization headers (JWT token) from local storage
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token 
    ? { headers: { Authorization: `Bearer ${token}` } } 
    : {};
};

/**
 * Fetch a single message by ID (used to populate quote/reply references)
 */
export const getMessageById = async (
  characterId: string | number,
  messageId: number,
  token: string | null
): Promise<ChatMessageType | null> => {
  try {
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};

    const response = await axios.get<BackendMessage>(
      `${API_URL}/chat/chat/${characterId}/message/${messageId}`,
      config
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
 * Fetch a paginated chunk of conversation history from the backend
 * Includes reply_to_id for reconstructing quoted/replied messages
 */
export const fetchChatHistory = async (
  characterId: string | number, 
  token: string | null,
  limit: number = 30,
  offset: number = 0
): Promise<ChatMessageType[]> => {
  
  const config = token 
    ? { headers: { Authorization: `Bearer ${token}` } } 
    : {};

  const response = await axios.get<BackendMessage[]>(
    `${API_URL}/chat/chat/${characterId}/historico?limit=${limit}&offset=${offset}`, 
    config
  );
  
  const messages = response.data.map((msg) => ({
    id: msg.id,
    sender: (msg.role === 'model' ? 'model' : 'user') as 'user' | 'model',
    text: msg.content,
    pinned: msg.is_pinned,
    isError: false,
    reply_to_id: msg.reply_to_id || null,
    quote: undefined as any,
  } as ChatMessageType));

  // Populate quotes for messages that have reply_to_id
  
  for (const msg of messages) {
    if (msg.reply_to_id) {
      try {
        const originalMsg = await getMessageById(characterId, msg.reply_to_id, token);
        if (originalMsg) {
          msg.quote = {
            sender: originalMsg.sender,
            text: originalMsg.text,
          };
        }
      } catch (err) {
        console.error('[CHAT SERVICE] Error fetching quote for message', msg.id, err);
      }
    }
  }

  return messages;
};

/**
 * Dispatches input payloads to trigger Gemini pipelines and message tracking logic
 * Supports optional replyToId to establish quote/reply relationships
 */
export const sendChatMessage = async (
  characterId: string | number,
  message: string,
  token: string | null,
  replyToId?: number | null
): Promise<ChatResponse> => {
  const config = token 
    ? { headers: { Authorization: `Bearer ${token}` } } 
    : {};

  const payload: any = { message };
  if (replyToId) {
    payload.replyToId = replyToId;
  }

  const response = await axios.post<ChatResponse>(
    `${API_URL}/chat/chat/${characterId}`,
    payload,
    config
  );

  return response.data;
};

/**
 * Signals backend layers to wipe or invalidate cached text histories inside memory maps
 */
export const clearChatMemory = async (characterId: string | number): Promise<void> => {
  await axios.delete(`${API_URL}/chat/${characterId}/limpar`, getAuthHeaders());
};

/**
 * Delete a specific message by its unique database ID
 */
export const deleteMessage = async (messageId: number): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_URL}/chat/messages/${messageId}`, getAuthHeaders());
  return response.data;
};

/**
 * Update pin status of a single message
 */
export const togglePinMessage = async (messageId: number, isPinned: boolean): Promise<BackendMessage> => {
  
  const response = await axios.patch(
    `${API_URL}/chat/messages/${messageId}/pin`,
    { isPinned },
    getAuthHeaders()
  );
  return response.data;
};

/**
 * Fetch all pinned messages from a given chat session ID
 */
export const getPinnedMessages = async (chatId: number): Promise<BackendMessage[]> => {
  const response = await axios.get(
    `${API_URL}/chat/chats/${chatId}/pinned`,
    getAuthHeaders()
  );

  console.log('[getPinnedMessages] Fetched pinned messages:', response.data);
  return response.data;
};

/**
 * Extracts and maps server exceptions cleanly to human-friendly feedback messages
 */
export const extractErrorMessage = (err: any): string => {
  const status = err.response?.status;

  if (status === 401) return 'Sua sessão expirou. Por favor, faça login novamente.';
  if (status === 404) return 'Personagem não encontrado.';
  if (status === 503) return 'Minha mente está um pouco confusa agora... me chame novamente daqui a pouco.';

  return (
    err.response?.data?.message ??
    err.response?.data?.error ??
    err.message ??
    'Ocorreu um erro, tente novamente mais tarde.'
  );
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
    getAuthHeaders()
  );
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
    getAuthHeaders()
  );
  return response.data;
};

/**
 * Send time via sendBeacon (safe for page unload events)
 */
export const beaconConversationTime = (payload: ConversationTimePayload): void => {
  const token = localStorage.getItem('token');
  const blob = new Blob([JSON.stringify({ ...payload, token })], {
    type: 'application/json',
  });
  navigator.sendBeacon(`${API_URL}/chat/conversation-time`, blob);
};