import { API_URL } from "../../config/api";
import axios from "axios";
import type { Character, CharacterbyId, views, Tag, RecentCharacter } from "../../types/characters/characters";

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
        console.log('Fetched paginated characters:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error fetching paginated characters:', error);
        throw error;
    }
};

export async function searchCharacterById(personagemId: number): Promise<CharacterbyId> {
    try {
        const res = await axios.get(`${API_URL}/character/data-character-by-id/${personagemId}`);
        return res.data;
    } catch (error) {
        console.error(`Error searching character data for ${personagemId}:`, error);
        throw error;
    }
}

export async function incrementChatViews(personagemId: number, token: string): Promise<views> {
    try {
        const res = await axios.post<views>(
            `${API_URL}/character/increment-chat-views/${personagemId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    } catch (err: any) {
        console.error('Error incrementing chat views:', err);
        throw err;
    }
}

export async function updateCharacterService(personagemId: number, payload: any, token: string): Promise<Character> {
    const res = await axios.put(
        `${API_URL}/character/update-character/${personagemId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

export async function createCharacterService(usuarioId: number, payload: any, token: string): Promise<Character> {
    try {
        const res = await axios.post(
            `${API_URL}/character/create-character/${usuarioId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
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
    personagemId: number
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
): Promise<{ success: boolean; resultados: Character[] }> {
    try {
        // Se houver tag, concatena &tag=nome-da-tag, senão deixa vazio
        const filtroTag = tag ? `&tag=${encodeURIComponent(tag)}` : '';
        const url = `${API_URL}/character/search-character?nomePersonagem=${encodeURIComponent(nomePersonagem)}${filtroTag}&limit=${limit}&offset=${offset}`;
        
        const res = await axios.get<{ success: boolean; resultados: Character[] }>(url);
        console.log('Resultados da busca por nome:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error searching character by name:', error);
        throw error;
    }
}