import axios from "axios";
import { API_URL } from "../../config/api";
import type { Character } from "../../types/characters/characters";
import type { PopularCharacter } from "../../types/discovery/discovery"

// Search characters most popular of the week
export async function getPopularWeek(): Promise<PopularCharacter[]> {
    try {
        const res = await axios.get<PopularCharacter[]>(`${API_URL}/discovery/popular-week`);
        return res.data;
    } catch (err) {
        console.error('Error searching popular week:', err);
        throw err;
    }
}

// Search for character recommendations based on user interaction history
export async function recommendationsByWeight(usuarioId: number, page: number = 1): Promise<Character[]> {
    try {
        const res = await axios.get<Character[]>(`${API_URL}/discovery/recommendations/${usuarioId}?page=${page}`);

        return res.data;
    } catch (err) {
        console.error('Error searching recommendations by weight:', err);
        throw err;
    }
}