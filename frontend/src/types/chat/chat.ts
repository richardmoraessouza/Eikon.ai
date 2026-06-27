export interface ChatResponse {
  id?: number; 
  reply: string | string[];
  success?: boolean;
  replyIds?: number[];      
  replyToIds?: (number | null)[]; 
  quotes?: Record<number, ReplyQuote>;
}

export interface ReplyQuote {
  sender: 'user' | 'model'; 
  text: string;
  id?: number; 
}

export interface ChatMessage {
  id: number; 
  sender: 'user' | 'model'; 
  text: string; 
  pinned: boolean; 
  isError?: boolean;
  reply_to_id?: number | null; 
  quote?: {
    sender: 'user' | 'model';
    text: string;
  };
}

export interface BackendMessage {
  id: number;
  chat_id?: number;
  role: 'user' | 'model';
  content: string;
  is_pinned: boolean;
  criado_em?: string;
  reply_to_id?: number | null;
}

export interface ConversationTimePayload {
  characterId: number;
  seconds: number;
}

export interface ConversationTimeResponse {
  success: boolean;
  total_seconds: number;
}

export interface ConversationTimeFetchResponse {
  total_seconds: number;
  updated_at?: string;
}