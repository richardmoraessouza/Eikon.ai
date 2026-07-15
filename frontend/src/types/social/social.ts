// ==================== FAVORITOS ====================
export interface Favorite {
  id: number;
  nome: string;
  fotoia?: string;
  bio?: string;
}

export interface FavoriteResponse {
  id: number;
  usuarioId: number;
  personagemId: string;
  createdAt?: string;
}

// ==================== LIKES ====================
export interface LikeResponse {
  id: number;
  usuarioId: number;
  personagemId: string;
  createdAt?: string;
}

export interface LikesQuantityResponse {
  personagemId: string;
  total: number;
  likes?: number;
}

// ==================== SOCIAL STATE ====================
export interface SocialData {
  favorites: string[];
  likes: string[];
  loading: boolean;
  error: string | null;
}

export interface SocialContextType extends SocialData {
  handleToggleLike: (personagemId: string) => Promise<void>;
  handleToggleFavorite: (personagemId: string) => Promise<void>;
  getQuantityLikes: (personagemId: string) => Promise<number>;
  isFavorite: (id: string) => boolean;
  isLiked: (id: string) => boolean;
}

export interface Seguidor {
  id: number;
  nome?: string;
  foto_perfil?: string | null;
  frame?: string | null;
}

export interface SeguirResponse {
  seguidores: Seguidor[];
  seguindo: Seguidor[];
}