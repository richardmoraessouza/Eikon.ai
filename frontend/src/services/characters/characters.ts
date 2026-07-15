import { API_URL } from "../../config/api";
import axios from "axios";
import type { Character, CharacterbyId, views, Tag, RecentCharacter, VisibilityResponse } from "../../types/characters/characters";


console.log('API_URL:', API_URL); // Log the API_URL to verify it's correct
export const getCharactersPaginated = async (
    limit = 20,
    offset = 0,
    seed = 0.5,
): Promise<Character[]> => {
    try {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            seed: String(seed),
        });
        const res = await axios.get<Character[]>(`${API_URL}/character/explore?${params}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching paginated characters:', error);
        throw error;
    }
};

export async function searchCharacterById(personagemPublicId: string | number): Promise<CharacterbyId> {
    try {
        const identifier = String(personagemPublicId);
        const isNumeric = /^\d+$/.test(identifier);
        const endpoint = isNumeric
            ? `/character/data-character-by-id/${encodeURIComponent(identifier)}`
            : `/character/data-character-by-public-id/${encodeURIComponent(identifier)}`;
        const res = await axios.get(`${API_URL}${endpoint}`);
        return res.data;
    } catch (error) {
        console.error(`Error searching character data for ${personagemPublicId}:`, error);
        throw error;
    }
}

export async function incrementChatViews(personagemPublicId: string | number, token: string): Promise<views> {
    try {
        const res = await axios.post<views>(
            `${API_URL}/character/increment-chat-views-public/${personagemPublicId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    } catch (err: any) {
        console.error('Error incrementing chat views:', err);
        throw err;
    }
}

export async function updateCharacterService(personagemIdentifier: string | number, payload: any, token?: string | null): Promise<Character> {
    const res = await axios.put(
        `${API_URL}/character/update-character/${encodeURIComponent(String(personagemIdentifier))}`,
        payload,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return res.data;
}

export async function createCharacterService(usuarioId: number, payload: any, token?: string | null): Promise<Character> {
    try {
        const res = await axios.post(
            `${API_URL}/character/create-character/${usuarioId}`,
            payload,
            token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        return res.data;
    } catch (err: any) {
        console.error('[createCharacterService] Erro ao criar:', err?.response?.data || err?.message);
        throw err;
    }
}

export const fetchTagsService = async (): Promise<Tag[]> => {
    try {
        const res = await axios.get<Tag[]>(`${API_URL}/ratings/tags`);
        return res.data;
    } catch (error) {
        console.error('Error fetching system tags:', error);
        throw error;
    }
};

export const fetchCharactersByCategoryService = async (
    slug: string,
    limit = 20,
    offset = 0
): Promise<Character[]> => {
    try {
        const res = await axios.get<Character[]>(
            `${API_URL}/ratings/characters/${slug}?limit=${limit}&offset=${offset}`
        );
        return res.data;
    } catch (error) {
        console.error(`Error fetching characters for category "${slug}":`, error);
        throw error;
    }
};

export async function getCharactersByUserId(usuarioId: number): Promise<Character[]> {
    try {
        const res = await axios.get(`${API_URL}/character/user-search-by-id/${usuarioId}`);
        const data = res.data;
        return Array.isArray(data) ? data : (data?.personagens || []);
    } catch (error) {
        console.error(`Error fetching characters for user ${usuarioId}:`, error);
        return [];
    }
}

export async function getRecentCharacters(usuarioId: number): Promise<Character[]> {
    try {
        const res = await axios.get(`${API_URL}/character/get-recent-characters/${usuarioId}`);
        const data = res.data;
        return Array.isArray(data) ? data : (data?.personagens || []);
    } catch (error) {
        console.error(`Error fetching recent characters for user ${usuarioId}:`, error);
        return [];
    }
}

export async function recentCharactersService(
    usuarioId: number,
    personagemId: string | number
): Promise<RecentCharacter> {
    try {
        const res = await axios.post<RecentCharacter>(
            `${API_URL}/character/recent-characters/${usuarioId}/${personagemId}`,
            {}
        );
        return res.data;
    } catch (err: any) {
        console.error('[recentCharactersService] Erro ao registrar personagem recente:', err);
        throw err;
    }
}

// search for characters by name
export async function searchCharacterByNameService(
    nomePersonagem: string, 
    tag = '',
    limit: number = 20,
    offset: number = 0
): Promise<Character[]> {
    try {
        const filtroTag = tag ? `&tag=${encodeURIComponent(tag)}` : '';
        const url = `${API_URL}/character/search-character?q=${encodeURIComponent(nomePersonagem)}${filtroTag}&limit=${limit}&offset=${offset}`;
        
        const res = await axios.get<any>(url);
        const data = res.data;
        if (Array.isArray(data)) {
            return data;
        }
        return Array.isArray(data?.resultados) ? data.resultados : [];
    } catch (error) {
        console.error('Error searching character by name:', error);
        throw error;
    }
}

// Search for recent characters by user
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

export async function updateCharacterVisibilityService(
    publicId: string,
    isPublic: boolean,
    token?: string | null
): Promise<VisibilityResponse> {
    try {
        const res = await axios.patch<VisibilityResponse>(
            `${API_URL}/character/update-visibility/${publicId}`,
            { is_public: isPublic },
            token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        return res.data;
    } catch (error: any) {
        console.error(`[updateCharacterVisibilityService] Erro ao alterar visibilidade para ${publicId}:`, error?.response?.data || error?.message);
        throw error;
    }
}