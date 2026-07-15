import axios from "axios";
import { API_URL } from "../config/api";
import { 
  SearchLikesUser, 
  SearchQuantityLikes, 
  toggleLike as socialToggleLike, 
  SearchFavoritesUser, 
  toggleFavorite as socialToggleFavorite 
} from "./social/socialService";

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
    return Array.isArray(res.data) ? res.data : (res.data?.personagens || []);
  } catch (err: any) {
    const status = err.response?.status || 'Conexão';
    console.error(`[buscarPersonagensUsuario] Erro ${status} em ${url}`);
    
    if (err.response?.data) console.error('Resposta da API:', err.response.data);
    console.error('Mensagem Axios:', err.message);
    return [];
  }
}

export async function buscarPersonagens() {
  const url = `${API_URL}/character/explore`;
  console.log('[buscarPersonagens] Iniciando busca:', url);
  try {
    const res = await axios.get(url);
    return Array.isArray(res.data) ? res.data : (res.data?.personagens || []);
  } catch (err: any) {
    const status = err.response?.status || 'Conexão';
    console.error(`[buscarPersonagens] Erro ${status} em ${url}`);
    
    // Loga separadamente para garantir visibilidade no console
    if (err.response?.data) console.error('Resposta da API:', err.response.data);
    console.error('Mensagem Axios:', err.message);
    return [];
  }
}

export async function buscarDadosPersonagem(personagemId: number) {
  const url = `${API_URL}/character/data-character/${personagemId}`;
  try {
    const res = await axios.get(url);
    return res.data || null;
  } catch (err: any) {
    const status = err.response?.status || 'Conexão';
    console.error(`[buscarDadosPersonagem] Erro ${status} na URL ${url}:`, {
      message: err.message,
      apiData: err.response?.data
    });
    return null;
  }
}

export async function recentCharacters(usuarioId: number, personagemId: number) {
  try {
    const res = await axios.post(`${API_URL}/character/recent-characters/${usuarioId}/${personagemId}`, {});
    return res.data || {};
  } catch (err: any) {
    const status = err.response?.status || 'Conexão';
    console.error(`[recentCharacters] Erro ${status} ao atualizar personagens recentes`);
    
    if (err.response?.data) console.error('Resposta da API:', err.response.data);
    console.error('Mensagem Axios:', err.message);
    throw err;
  }
}

export async function buscarPersonagensRecentes(usuarioId: number) {
  const url = `${API_URL}/character/get-recent-characters/${usuarioId}`;
  try {
    const res = await axios.get(url);
    return Array.isArray(res.data) ? res.data : (res.data?.personagens || []);
  } catch (err: any) {
    const status = err.response?.status || 'Conexão';
    console.error(`[buscarPersonagensRecentes] Erro ${status} em ${url}`);
    
    if (err.response?.data) console.error('Resposta da API:', err.response.data);
    console.error('Mensagem Axios:', err.message);
    return []; // Retorna array vazio para evitar crash no .length/.map
  }
}
// ==================== USUÁRIOS ====================

export async function buscarNomeUsuario(usuarioId: number) {
  try {
    const res = await axios.get(`${API_URL}/users/name-user/${usuarioId}`);
    return res.data?.nome || res.data?.name || 'IA';
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
    return res.data?.nome || res.data?.name || 'IA';
  } catch (err) {
    console.warn('Erro ao buscar nome do criador', err);
    return 'IA';
  }
}

export async function buscarDadosUsuario(usuarioId: number, token: string) {
  const cleanToken = validateToken(token);
  try {
    const res = await axios.get(`${API_URL}/users/user/${usuarioId}`, {
      headers: { Authorization: `Bearer ${cleanToken}` },
      // Adicionado timeout para evitar requisições infinitas em caso de erro de rede
      timeout: 10000 
    });
    return res.data || null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    console.error(`[buscarDadosUsuario] Erro ao buscar dados do usuário ${usuarioId}:`, err.message);
    throw err;
  }
}

export async function editarPerfilUsuario(usuarioId: number, dados: any, token: string) {
  const cleanToken = validateToken(token);
  try {
    const res = await axios.put(`${API_URL}/users/edit-profile/${usuarioId}`, dados, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    });
    return res.data || null;
  } catch (err: any) {
    console.error(`[editarPerfilUsuario] Erro ao editar perfil do usuário ${usuarioId}:`, err.message);
    throw err;
  }
}

// ==================== LIKES ====================

export async function buscarLikesUsuario(usuarioId: number, token?: string) {
  return SearchLikesUser(usuarioId, token);
}

export async function buscarQuantidadeLikes(personagemId: string) {
  return SearchQuantityLikes(personagemId);
}

export async function toggleLike(usuarioId: number, personagemId: string, token: string) {
  return socialToggleLike(usuarioId, personagemId, token);
}

// ==================== FAVORITOS ====================

export async function buscarFavoritosUsuario(usuarioId: number) {
  return SearchFavoritesUser(usuarioId);
}

export async function toggleFavorito(usuarioId: number, personagemId: string, token: string) {
  return socialToggleFavorite(usuarioId, personagemId, token);
}