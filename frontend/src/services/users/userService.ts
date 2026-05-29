import axios from "axios";
import { API_URL } from "../../config/api";
import type { creatorName } from "../../types/users/users";

// search for the name of the character's creator
export async function searchCreatorName(usuarioId: number): Promise<creatorName> {
    const response = await axios.get(`${API_URL}/users/name-user/${usuarioId}`);
    return response.data;
}