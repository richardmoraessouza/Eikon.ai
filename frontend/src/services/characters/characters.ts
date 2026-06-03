import { API_URL } from "../../config/api";
import axios from "axios";
import type { Character, CharacterbyId, views, Tag} from "../../types/characters/characters";

// show all characters in the explore page
export const getCharacters = async (): Promise<Character[]> => {
    try {
        const response = await axios.get<Character[]>(`${API_URL}/character/explore`);

        if (response.status !== 200) {
            throw new Error('Error searching characters');
        }

        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Search for the character data by id
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
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        // Mudado para .post para casar com a boa prática do backend
        const res = await axios.post<views>(`${API_URL}/character/increment-chat-views/${personagemId}`, {}, config);

        return res.data;
    } catch (err: any) {
        console.error('Error incrementing chat views:', err);
        throw err;
    }
}

// update character
export async function updateCharacterService(personagemId: number, payload: any, token: string): Promise<Character> {
    const res = await axios.put(
        `${API_URL}/character/update-character/${personagemId}`, 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// create character
export async function createCharacterService(usuarioId: number, payload: any, token: string): Promise<Character> {
    const res = await axios.post(
        `${API_URL}/character/create-character/${usuarioId}`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

/**
 * Fetches all available categories/tags to render the filter buttons on the UI
 */
export const fetchTagsService = async (): Promise<Tag[]> => {
    try {
        const res = await axios.get<Tag[]>(`${API_URL}/ratings/tags`);
        return res.data;
    } catch (error) {
        console.error('Error fetching system tags:', error);
        throw error;
    }
};

/**
 * Fetches characters for a specific category slug using your global Character type
 */
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