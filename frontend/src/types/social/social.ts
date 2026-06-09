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
  personagemId: number;
  createdAt?: string;
}

// ==================== LIKES ====================
export interface LikeResponse {
  id: number;
  usuarioId: number;
  personagemId: number;
  createdAt?: string;
}

export interface LikesQuantityResponse {
  personagemId: number;
  total: number;
  likes?: number;
}

// ==================== SOCIAL STATE ====================
export interface SocialData {
  favorites: number[];
  likes: number[];
  loading: boolean;
  error: string | null;
}

export interface SocialContextType extends SocialData {
  handleToggleLike: (personagemId: number) => Promise<void>;
  handleToggleFavorite: (personagemId: number) => Promise<void>;
  getQuantityLikes: (personagemId: number) => Promise<number>;
  isFavorite: (id: number) => boolean;
  isLiked: (id: number) => boolean;
}
