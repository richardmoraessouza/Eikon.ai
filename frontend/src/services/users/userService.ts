import axios from "axios";
import { API_URL } from "../../config/api";
import type { User, UpdateUserResponse } from "../../types/users/users";

// search for the name of the character's creator
export async function searchCreatorNameService(usuarioId: number | null): Promise<User> {
    if (!usuarioId) {
        throw new Error('Usuario ID é obrigatório');
    }
    
    try {
        const response = await axios.get(`${API_URL}/users/name-user/${usuarioId}`);

        return response.data;
    } catch (error) {
        console.error(`Error searching creator name for ${usuarioId}:`, error);
        throw error;
    }
}

// update profile user
export async function updateUserService(
    usuarioId: number, 
    token: string,
    userData: { nome: string; foto_perfil?: string; descricao?: string }
): Promise<UpdateUserResponse> {
    try {
        const response = await axios.put(`${API_URL}/users/edit-profile/${usuarioId}`, userData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
         console.error('Error updating user:', error);
         throw error;
    }
}