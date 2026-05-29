import axios from "axios";
import { API_URL } from "../config/api";
import type { PopularCharacter } from "../types/discovery"

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