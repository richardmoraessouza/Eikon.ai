import axios from "axios";
import { API_URL } from "../config/api";

// Helper para validar e limpar token
function validateToken(token: string | null): string {
  if (!token) {
    throw new Error('Token não fornecido');
  }
  
  const cleanToken = token.trim();
  
  if (!cleanToken) {
    throw new Error('Token vazio');
  }
  
  if (!cleanToken.includes('.')) {
    console.error('[validateToken] Token não é um JWT válido:', {
      length: cleanToken.length,
      start: cleanToken.substring(0, 20),
      end: cleanToken.substring(Math.max(0, cleanToken.length - 20))
    });
    throw new Error('Token não é um JWT válido');
  }
  
  return cleanToken;
}

// ==================== PERSONAGENS ====================

export async function buscarPersonagensUsuario(usuarioId: number) {
  const url = `${API_URL}/character/user-search-by-id/${usuarioId}`;
  console.log('[buscarPersonagensUsuario] URL:', url);
  try {
    const res = await axios.get(url);
    return Array.isArray(res.data) ? res.data : res.data.personagens || [];
  } catch (err: any) {
    console.error('[buscarPersonagensUsuario] Erro na URL:', url, err);
    throw err;
  }
}

export async function buscarPersonagens() {
  const res = await axios.get(`${API_URL}/character/explore`);
  return Array.isArray(res.data) ? res.data : res.data.personagens || [];
}

export async function buscarDadosPersonagem(personagemId: number) {
  const res = await axios.get(`${API_URL}/character/data-character/${personagemId}`);
  return res.data;
}

export async function recentCharacters(usuarioId: number, personagemId: number) {
  try {
    const res = await axios.post(`${API_URL}/character/recent-characters/${usuarioId}/${personagemId}`);
    return res.data;

  } catch (err: any) {
    console.error('Erro ao atualizar personagens recentes', err);
    throw err;
  }
}

export async function buscarPersonagensRecentes(usuarioId: number) {
  const url = `${API_URL}/character/get-recent-characters/${usuarioId}`;
  console.log('[buscarPersonagensRecentes] URL:', url);
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    console.error('[buscarPersonagensRecentes] Erro na URL:', url, err);
    throw err;
  }
}
// ==================== USUÁRIOS ====================

export async function buscarNomeUsuario(usuarioId: number) {
  try {
    const res = await axios.get(`${API_URL}/users/name-user/${usuarioId}`);
    return (res.data && (res.data.nome || res.data.name)) ? (res.data.nome || res.data.name) : 'IA';
  } catch (err) {
    console.warn('Erro ao buscar nome do usuário', err);
    return 'IA';
  }
}

export async function buscarNomeCriador(usuarioId: number, token: string | null) {
  try {
    const cleanToken = token ? validateToken(token) : null;
    const config = cleanToken ? { headers: { Authorization: `Bearer ${cleanToken}` } } : {};
    const res = await axios.get(`${API_URL}/users/name-user/${usuarioId}`, config);
    return (res.data && (res.data.nome || res.data.name)) ? (res.data.nome || res.data.name) : 'IA';
  } catch (err) {
    console.warn('Erro ao buscar nome do criador', err);
    return 'IA';
  }
}

export async function buscarDadosUsuario(usuarioId: number, token: string) {
  const cleanToken = validateToken(token);
  const res = await axios.get(`${API_URL}/users/user/${usuarioId}`, {
    headers: { Authorization: `Bearer ${cleanToken}` }
  });
  return res.data;
}

export async function editarPerfilUsuario(usuarioId: number, dados: any, token: string) {
  const cleanToken = validateToken(token);
  const res = await axios.put(`${API_URL}/users/edit-profile/${usuarioId}`, dados, {
    headers: { Authorization: `Bearer ${cleanToken}` }
  });
  return res.data;
}

// ==================== LIKES ====================

export async function buscarLikesUsuario(usuarioId: number, token?: string) {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const res = await axios.get(`${API_URL}/social/likes-by-user/${usuarioId}`, config);
    return Array.isArray(res.data) ? res.data.map((id: any) => Number(id)) : [];
  } catch (err: any) {
    console.error('[buscarLikesUsuario] Erro:', err?.response?.status, err?.message);
    return [];
  }
}

export async function buscarQuantidadeLikes(personagemId: number) {
  const res = await axios.get(`${API_URL}/social/likes-quantity/${personagemId}`);
  return res.data.total || res.data.likes || 0;
}

export async function toggleLike(usuarioId: number, personagemId: number, token: string) {
  const res = await axios.post(
    `${API_URL}/social/toggle-like/${usuarioId}/${personagemId}`,
    {},  // ← Mude de null para {}
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// ==================== FAVORITOS ====================

export async function buscarFavoritosUsuario(usuarioId: number) {
  const res = await axios.get(`${API_URL}/social/favorites-by-user/${usuarioId}`);
  // Se a resposta for um array de objetos com dados completos, retorna assim
  if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].nome) {
    return res.data;
  }
  // Caso contrário, retorna apenas os IDs como antes
  return Array.isArray(res.data) ? res.data.map((item: any) => Number(item.id || item)) : [];
}

export async function toggleFavorito(usuarioId: number, personagemId: number, token: string) {
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
    const headers = {  // ← Esta linha estava faltando
      Authorization: `Bearer ${cleanToken}`,
      'Content-Type': 'application/json'
    };
    
    const res = await axios.post(
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