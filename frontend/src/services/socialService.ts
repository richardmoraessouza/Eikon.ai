import axios from "axios";
import { API_URL } from "../config/api";
import type { Favorite, FavoriteResponse, LikeResponse, LikesQuantityResponse } from "../types/social";

// ==================== LIKES ====================
//// Route to show likes that the user has given 
export async function SearchLikesUser(usuarioId: number, token?: string): Promise<number[]> {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const res = await axios.get(`${API_URL}/social/likes-by-user/${usuarioId}`, config);
    return Array.isArray(res.data) ? res.data.map((id: any) => Number(id)) : [];
  } catch (err: any) {
    console.error('[SearchLikesUser] Erro:', err?.response?.status, err?.message);
    return [];
  }
}

// Route to show the quantity of likes for a character
export async function SearchQuantityLikes(personagemId: number): Promise<number> {
  const res = await axios.get<LikesQuantityResponse>(`${API_URL}/social/likes-quantity/${personagemId}`);
  return res.data.total || res.data.likes || 0;
}

// Route to toggle like (add or remove)
export async function toggleLike(usuarioId: number, personagemId: number, token: string): Promise<LikeResponse> {
  const res = await axios.post<LikeResponse>(
    `${API_URL}/social/toggle-like/${usuarioId}/${personagemId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// ==================== FAVORITOS ====================

// Route to show favorites that the user has given
export async function SearchFavoritesUser(usuarioId: number): Promise<number[] | Favorite[]> {
  const res = await axios.get(`${API_URL}/social/favorites-by-user/${usuarioId}`);
  // Se a resposta for um array de objetos com dados completos, retorna assim
  if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].nome) {
    return res.data as Favorite[];
  }
  // Caso contrário, retorna apenas os IDs como antes
  return Array.isArray(res.data) ? res.data.map((item: any) => Number(item.id || item)) : [];
}

// Route to toggle favorite (add or remove)
export async function toggleFavorite(usuarioId: number, personagemId: number, token: string): Promise<FavoriteResponse> {
  const cleanToken = token?.trim() || '';
  
  if (!cleanToken) {
    throw new Error('Token inválido ou vazio');
  }
  
  if (!cleanToken.includes('.')) {
    console.error('[toggleFavorito] Token não parece ser um JWT válido', {
      tokenLength: cleanToken.length,
      tokenStart: cleanToken.substring(0, 20),
      tokenEnd: cleanToken.substring(cleanToken.length - 20)
    });
    throw new Error('Formato de token inválido');
  }
  
  try {
    const headers = {
      Authorization: `Bearer ${cleanToken}`,
      'Content-Type': 'application/json'
    };
    
    const res = await axios.post<FavoriteResponse>(
      `${API_URL}/social/favorites/${usuarioId}/${personagemId}`,
      {},
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('[toggleFavorito] Erro na requisição', {
      usuarioId,
      personagemId,
      status: error?.response?.status,
      message: error?.response?.data?.error || error?.message,
      tokenExists: !!cleanToken,
      tokenLength: cleanToken.length,
      responseData: error?.response?.data,
      url: error?.config?.url,
      headers: error?.config?.headers
    });
    throw error;
  }
}