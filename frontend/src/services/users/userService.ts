import axios from "axios";
import { API_URL } from "../../config/api";
import type { User, UpdateUserResponse, MiniProfileType } from "../../types/users/users";
import { normalizeFrame } from "../../utils/frame";

// search for the name of the character's creator
export async function searchCreatorNameService(usuarioId: number | null): Promise<User> {
    if (!usuarioId) {
        throw new Error('Usuario ID é obrigatório');
    }
    
    try {
        const response = await axios.get(`${API_URL}/users/name-user/${usuarioId}`);
        const data = response.data;
        return {
            ...data,
            frame: normalizeFrame(data.frame),
        };
    } catch (error) {
        console.error(`Error searching creator name for ${usuarioId}:`, error);
        throw error;
    }
}

// update profile user
export async function updateUserService(
    usuarioId: number, 
    token: string,
    userData: { nome: string; foto_perfil?: string; descricao?: string; username?: string }
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

// Shows user data in mini profile
export async function getMiniProfileService(usuarioId: number): Promise<MiniProfileType> {
  if (!usuarioId) {
    throw new Error('Usuario ID é obrigatório');
  }

  try {
    const response = await axios.get(`${API_URL}/users/mini-profile/${usuarioId}`);
    const d = response.data;
    return {
        usuarioId: d.id,
        nome:      d.nome,
        foto:      d.foto_perfil,
        descricao: d.descricao,
        username:  d.username ?? null,
        frame:     normalizeFrame(d.frame),
        is_online: d.is_online,
        nivel:     d.nivel ?? null,
    };
  } catch (error) {
    console.error(`Error loading mini profile data for user ${usuarioId}:`, error);
    throw error;
  }
}

// Update user frame
export async function updateFrameService (usuarioId: number, frame: string): Promise<User> {
    try {
        const res = await axios.put(`${API_URL}/users/update-frame/${usuarioId}`, { frame });
        return {
            ...res.data,
            frame: normalizeFrame(res.data?.frame ?? frame),
        };

    } catch (error: any) {
        console.error(`Error updating frame:`, error.response?.data);
        throw error;
    }
}