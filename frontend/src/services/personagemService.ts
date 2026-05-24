import axios from "axios";
import { API_URL } from "../config/api";

// ==================== PERSONAGENS ====================

export async function buscarPersonagensUsuario(usuarioId: number) {
  const res = await axios.get(`${API_URL}/character/user-search-by-id/${usuarioId}`);
  return Array.isArray(res.data) ? res.data : res.data.personagens || [];
}

export async function buscarPersonagens() {
  const res = await axios.get(`${API_URL}/character/explore`);
  return Array.isArray(res.data) ? res.data : res.data.personagens || [];
}

export async function buscarDadosPersonagem(personagemId: number) {
  const res = await axios.get(`${API_URL}/character/data-character/${personagemId}`);
  return res.data;
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
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const res = await axios.get(`${API_URL}/users/name-user/${usuarioId}`, config);
    return (res.data && (res.data.nome || res.data.name)) ? (res.data.nome || res.data.name) : 'IA';
  } catch (err) {
    console.warn('Erro ao buscar nome do criador', err);
    return 'IA';
  }
}

export async function buscarDadosUsuario(usuarioId: number, token: string) {
  const res = await axios.get(`${API_URL}/users/user/${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarPerfilUsuario(usuarioId: number, dados: any, token: string) {
  const res = await axios.put(`${API_URL}/users/editProfile/${usuarioId}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// ==================== LIKES ====================

export async function buscarLikesUsuario(usuarioId: number) {
  const res = await axios.get(`${API_URL}/social/likes-by-user/${usuarioId}`);
  return Array.isArray(res.data) ? res.data.map((id: any) => Number(id)) : [];
}

export async function buscarQuantidadeLikes(personagemId: number) {
  const res = await axios.get(`${API_URL}/social/likes-quantity/${personagemId}`);
  return res.data.total || res.data.likes || 0;
}

export async function toggleLike(usuarioId: number, personagemId: number, token: string) {
  const res = await axios.post(
    `${API_URL}/social/toggle-like/${usuarioId}/${personagemId}`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// ==================== FAVORITOS ====================

export async function buscarFavoritosUsuario(usuarioId: number) {
  const res = await axios.get(`${API_URL}/social/favorites-by-user/${usuarioId}`);
  return Array.isArray(res.data) ? res.data.map((item: any) => Number(item.id || item)) : [];
}

export async function toggleFavorito(usuarioId: number, personagemId: number, token: string) {
  const res = await axios.post(
    `${API_URL}/social/favorites/${usuarioId}/${personagemId}`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}