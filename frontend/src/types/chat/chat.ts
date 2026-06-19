export interface ChatResponse {
  id?: number; // Adicionado para alimentar o ID da resposta da IA no hook
  reply: string | string[];
  success?: boolean;
}

export interface ReplyQuote {
  sender: 'user' | 'model'; // Adjusted from 'bot' to 'model' to match ChatMessage
  text: string;
  id?: number; // Added to track the message being replied to
}

export interface ChatMessage {
  id: number; 
  sender: 'user' | 'model'; 
  text: string; 
  pinned: boolean; 
  isError?: boolean;
  reply_to_id?: number | null; // Reference to the message being replied to
  quote?: {
    sender: 'user' | 'model';
    text: string;
  };
}

// Format received from the backend API
export interface BackendMessage {
  id: number;
  chat_id?: number;
  role: 'user' | 'model';
  content: string;
  is_pinned: boolean;
  criado_em?: string;
  reply_to_id?: number | null; // Reference to the message being replied to
}