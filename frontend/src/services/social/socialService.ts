import axios from "axios";
import { API_URL } from "../../config/api";
import type { Favorite, FavoriteResponse, LikeResponse, LikesQuantityResponse, Seguidor } from "../../types/social/social";

// ==================== LIKES ====================
//// Route to show likes that the user has given 
export async function SearchLikesUser(usuarioId: number, token?: string | null): Promise<string[]> {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
    const res = await axios.get(`${API_URL}/social/likes-by-user/${usuarioId}`, config);
    return Array.isArray(res.data) ? res.data.map((item: any) => (typeof item === 'string' ? item : (item?.public_id ?? item?.id ?? ''))) : [];
  } catch (err: any) {
    console.error('[SearchLikesUser] Erro:', err?.response?.status, err?.message);
    return [];
  }
}

// Route to show the quantity of likes for a character
export async function SearchQuantityLikes(personagemId: string): Promise<number> {
  if (typeof personagemId !== 'string' || !personagemId.trim()) {
    console.warn('[SearchQuantityLikes] Invalid personagemId:', personagemId);
    return 0;
  }

  const res = await axios.get<LikesQuantityResponse>(`${API_URL}/social/likes-quantity/${personagemId}`, { withCredentials: true });
  return Number(res.data.likes ?? res.data.total ?? 0);
}

// Route to toggle like (add or remove)
export async function toggleLike(usuarioId: number, personagemId: string, token?: string | null): Promise<LikeResponse> {
  const headers = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
  const res = await axios.post<LikeResponse>(
    `${API_URL}/social/toggle-like/${usuarioId}/${personagemId}`,
    {},
    headers
  );
  return res.data;
}

// ==================== FAVORITOS ====================

// Route to show favorites that the user has given
export async function SearchFavoritesUser(usuarioId: number): Promise<string[] | Favorite[]> {
  const res = await axios.get(`${API_URL}/social/favorites-by-user/${usuarioId}`, { withCredentials: true });
  
  if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].nome) {
    return res.data as Favorite[];
  }
 
  return Array.isArray(res.data) ? res.data.map((item: any) => (typeof item === 'string' ? item : (item?.public_id ?? item?.id ?? item))) : [];
}

// Route to toggle favorite (add or remove)
export async function toggleFavorite(usuarioId: number, personagemId: string, token?: string | null): Promise<FavoriteResponse> {
  try {
    const headers = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      : { withCredentials: true };
    
    const res = await axios.post<FavoriteResponse>(
      `${API_URL}/social/favorites/${usuarioId}/${personagemId}`,
      {},
      headers
    );
    return res.data;
  } catch (error: any) {
    console.error('[toggleFavorito] Erro na requisição', {
      usuarioId,
      personagemId,
      status: error?.response?.status,
      message: error?.response?.data?.error || error?.message
    });
    throw error;
  }
}

export async function getSeguidoresService(usuarioId: number): Promise<Seguidor[]> {
  const response = await axios.get(`${API_URL}/social/users/${usuarioId}/followers`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getSeguindoService(usuarioId: number): Promise<Seguidor[]> {
  const response = await axios.get(`${API_URL}/social/users/${usuarioId}/following`);
  return Array.isArray(response.data) ? response.data : [];
}