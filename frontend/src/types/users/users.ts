export interface User {
    id: number;
    nome: string;
    gmail?: string;
    foto_perfil?: string;
    descricao?: string;
    username?: string;
    avatarUrl?: string;
    frame: string | null;
}

export interface UpdateUserResponse {
    success: boolean;
    error?: string;
    usuario_atualizado?: User;
}

// Manter compatibilidade com código existente
export type creatorName = User;

export interface MiniProfile {
  usuarioId: number;
  nome: string;
  foto: string;
  frame: string | null;
  is_online: boolean;
}

export interface MiniProfileType {
  usuarioId: number;
  nome: string;
  foto?: string | null;
  descricao?: string | null;
  username?: string | null;
  frame?: string | null;
  is_online?: boolean;
  nivel?: number | null;
  unlocked_frames?: string[];
}